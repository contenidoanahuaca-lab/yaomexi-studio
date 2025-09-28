from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4
import json

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from redis.asyncio import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_NAME = os.getenv("QUEUE_NAME", "yaomexi:videos")
JOB_KEY_PREFIX = os.getenv("JOB_KEY_PREFIX", "video_job:")
UPLOAD_KEY_PREFIX = os.getenv("UPLOAD_KEY_PREFIX", "editor_upload:")
VIDEOS_DIR = Path(os.getenv("VIDEOS_DIR", "/videos"))
UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", VIDEOS_DIR / "uploads"))
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ORIGINS = ["http://localhost:3000", "https://yaomexicatl.mx"]

redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


def redis_dependency(request: Request) -> Redis:
    return request.app.state.redis_client  # type: ignore[return-value]


class CreateTikTokVideoRequest(BaseModel):
    template: str = Field(..., min_length=3)
    script: str = Field(..., min_length=50)
    voice: str = Field(..., min_length=3)


class UploadClipResponse(BaseModel):
    upload_id: str
    filename: str
    size: int


class TimelineClip(BaseModel):
    upload_id: str = Field(..., min_length=3)
    duration: float = Field(..., gt=0)


class CreateTimelineJobRequest(BaseModel):
    clips: list[TimelineClip] = Field(..., min_length=1)


class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["QUEUED", "PROCESSING", "DONE", "FAILED"]
    download_url: str | None = None
    message: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


app = FastAPI(title="Yaomexi Studio API", version="0.2.0")
app.state.redis_client = redis_client
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await app.state.redis_client.aclose()


@app.get("/healthz")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/editor/uploads", response_model=UploadClipResponse, status_code=status.HTTP_201_CREATED)
async def upload_editor_clip(
    file: UploadFile = File(...), redis: Redis = Depends(redis_dependency)
) -> UploadClipResponse:
    if file.content_type and not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos de video.",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo de video está vacío.",
        )

    upload_id = uuid4().hex
    suffix = Path(file.filename or "").suffix or ".mp4"
    destination = UPLOADS_DIR / f"{upload_id}{suffix}"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)

    timestamp = datetime.now(timezone.utc).isoformat()
    clip_key = f"{UPLOAD_KEY_PREFIX}{upload_id}"
    await redis.hset(
        clip_key,
        mapping={
            "upload_id": upload_id,
            "original_filename": file.filename or "",
            "path": destination.as_posix(),
            "size": str(len(data)),
            "created_at": timestamp,
        },
    )
    await redis.expire(clip_key, 60 * 60 * 24)

    await file.close()
    return UploadClipResponse(
        upload_id=upload_id,
        filename=file.filename or destination.name,
        size=len(data),
    )


@app.post("/editor/jobs", status_code=status.HTTP_202_ACCEPTED, response_model=JobStatusResponse)
async def create_timeline_job(
    payload: CreateTimelineJobRequest, redis: Redis = Depends(redis_dependency)
) -> JobStatusResponse:
    for clip in payload.clips:
        clip_key = f"{UPLOAD_KEY_PREFIX}{clip.upload_id}"
        exists = await redis.exists(clip_key)
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El clip {clip.upload_id} no fue encontrado o expiró.",
            )

    job_id = uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat()
    job_key = f"{JOB_KEY_PREFIX}{job_id}"
    total_duration = sum(clip.duration for clip in payload.clips)

    mapping = {
        "job_id": job_id,
        "status": "QUEUED",
        "job_type": "timeline",
        "clips": json.dumps([clip.model_dump() for clip in payload.clips]),
        "total_duration": str(total_duration),
        "created_at": timestamp,
        "updated_at": timestamp,
        "download_url": "",
        "message": "",
    }

    await redis.hset(job_key, mapping=mapping)
    await redis.expire(job_key, 60 * 60 * 24)
    await redis.rpush(QUEUE_NAME, job_id)

    return JobStatusResponse(
        job_id=job_id,
        status="QUEUED",
        created_at=timestamp,
        updated_at=timestamp,
    )


@app.post("/videos/tiktok", status_code=status.HTTP_202_ACCEPTED, response_model=JobStatusResponse)
async def create_tiktok_video(
    payload: CreateTikTokVideoRequest, redis: Redis = Depends(redis_dependency)
) -> JobStatusResponse:
    job_id = uuid4().hex
    timestamp = datetime.now(timezone.utc).isoformat()
    job_key = f"{JOB_KEY_PREFIX}{job_id}"

    mapping = {
        "job_id": job_id,
        "status": "QUEUED",
        "job_type": "tiktok",
        "template": payload.template,
        "script": payload.script,
        "voice": payload.voice,
        "created_at": timestamp,
        "updated_at": timestamp,
        "download_url": "",
        "message": "",
    }

    await redis.hset(job_key, mapping=mapping)
    await redis.expire(job_key, 60 * 60 * 24)
    await redis.rpush(QUEUE_NAME, job_id)

    return JobStatusResponse(
        job_id=job_id, status="QUEUED", created_at=timestamp, updated_at=timestamp
    )


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str, redis: Redis = Depends(redis_dependency)
) -> JobStatusResponse:
    job_key = f"{JOB_KEY_PREFIX}{job_id}"
    job_data = await redis.hgetall(job_key)
    if not job_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    status_value = job_data.get("status", "QUEUED")
    download_url = job_data.get("download_url") or None
    message = job_data.get("message") or None

    return JobStatusResponse(
        job_id=job_id,
        status=status_value,  # type: ignore[arg-type]
        download_url=download_url,
        message=message,
        created_at=job_data.get("created_at"),
        updated_at=job_data.get("updated_at"),
    )


@app.get("/videos/{job_id}.mp4")
async def download_video(job_id: str, redis: Redis = Depends(redis_dependency)) -> FileResponse:
    job_key = f"{JOB_KEY_PREFIX}{job_id}"
    job_data = await redis.hgetall(job_key)
    if not job_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if job_data.get("status") != "DONE":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Job not completed")

    file_path = VIDEOS_DIR / f"{job_id}.mp4"
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not available")

    return FileResponse(path=file_path, media_type="video/mp4", filename=f"yaomexi_{job_id}.mp4")
