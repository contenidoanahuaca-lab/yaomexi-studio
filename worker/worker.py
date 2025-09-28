from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from moviepy.editor import ColorClip, VideoFileClip, concatenate_videoclips
from pydantic import BaseModel, Field
from redis import Redis

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("yaomexi.worker")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_NAME = os.getenv("QUEUE_NAME", "yaomexi:videos")
JOB_KEY_PREFIX = os.getenv("JOB_KEY_PREFIX", "video_job:")
UPLOAD_KEY_PREFIX = os.getenv("UPLOAD_KEY_PREFIX", "editor_upload:")
VIDEOS_DIR = Path(os.getenv("VIDEOS_DIR", "/videos"))
UPLOADS_DIR = Path(os.getenv("UPLOADS_DIR", VIDEOS_DIR / "uploads"))
POLL_TIMEOUT = int(os.getenv("WORKER_POLL_TIMEOUT", "10"))

VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


class TikTokVideoJob(BaseModel):
    job_id: str
    template: str = Field(..., min_length=3)
    script: str = Field(..., min_length=50)
    voice: str = Field(..., min_length=3)


class TimelineClip(BaseModel):
    upload_id: str = Field(..., min_length=3)
    duration: float = Field(..., gt=0)


class TimelineJob(BaseModel):
    job_id: str
    clips: list[TimelineClip]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def build_redis_client() -> Redis:
    return Redis.from_url(REDIS_URL, decode_responses=True)


def update_job(redis: Redis, job_id: str, **fields: Any) -> None:
    fields.setdefault("updated_at", now_iso())
    redis.hset(
        f"{JOB_KEY_PREFIX}{job_id}", mapping={str(key): str(value) for key, value in fields.items()}
    )


def render_tiktok_video(job: TikTokVideoJob, destination: Path) -> None:
    clip = ColorClip(size=(1080, 1920), color=(20, 184, 166))
    clip = clip.set_duration(5)
    clip.write_videofile(destination.as_posix(), codec="libx264", fps=24, audio=False, logger=None)
    clip.close()


def render_timeline_video(redis: Redis, job: TimelineJob, destination: Path) -> None:
    video_clips: list[VideoFileClip] = []
    try:
        for clip in job.clips:
            clip_key = f"{UPLOAD_KEY_PREFIX}{clip.upload_id}"
            clip_data = redis.hgetall(clip_key)
            clip_path = clip_data.get("path") if clip_data else None
            if not clip_path:
                raise ValueError(f"No se encontró el archivo para el clip {clip.upload_id}")

            source = Path(clip_path)
            if not source.exists():
                raise ValueError(f"El archivo {clip_path} no existe")

            video_clips.append(VideoFileClip(source.as_posix()))

        if not video_clips:
            raise ValueError("No hay clips para combinar")

        final_clip = concatenate_videoclips(video_clips, method="compose")
        final_clip.write_videofile(
            destination.as_posix(),
            codec="libx264",
            fps=24,
            audio_codec="aac",
            logger=None,
        )
        final_clip.close()
    finally:
        for clip in video_clips:
            clip.close()


def process_job(redis: Redis, job_id: str) -> None:
    job_data = redis.hgetall(f"{JOB_KEY_PREFIX}{job_id}")
    if not job_data:
        logger.warning("Job %s is missing from Redis", job_id)
        return

    job_type = job_data.get("job_type", "tiktok")

    if job_type == "timeline":
        process_timeline_job(redis, job_id, job_data)
    else:
        process_tiktok_job(redis, job_id, job_data)


def process_tiktok_job(redis: Redis, job_id: str, job_data: dict[str, str]) -> None:
    try:
        job = TikTokVideoJob(**job_data)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Job %s has invalid data: %s", job_id, exc)
        update_job(
            redis, job_id, status="FAILED", message="Datos inválidos para renderizar el video"
        )
        return

    update_job(redis, job_id, status="PROCESSING")
    output_path = VIDEOS_DIR / f"{job.job_id}.mp4"

    try:
        render_tiktok_video(job, output_path)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error rendering video for job %s: %s", job.job_id, exc)
        update_job(redis, job.job_id, status="FAILED", message="No se pudo generar el video")
        if output_path.exists():
            output_path.unlink(missing_ok=True)
        return

    update_job(
        redis,
        job.job_id,
        status="DONE",
        download_url=f"/backend/videos/{job.job_id}.mp4",
        message="Video listo para descarga",
    )


def process_timeline_job(redis: Redis, job_id: str, job_data: dict[str, str]) -> None:
    clips_raw = job_data.get("clips") or "[]"
    try:
        clips_payload = json.loads(clips_raw)
    except json.JSONDecodeError as exc:
        logger.exception("Job %s has invalid clips payload: %s", job_id, exc)
        update_job(
            redis, job_id, status="FAILED", message="Clips inválidos para el editor"
        )
        return

    try:
        job = TimelineJob(job_id=job_id, clips=clips_payload)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Job %s could not be parsed: %s", job_id, exc)
        update_job(
            redis, job_id, status="FAILED", message="No se pudo interpretar la timeline"
        )
        return

    update_job(redis, job_id, status="PROCESSING")
    output_path = VIDEOS_DIR / f"{job.job_id}.mp4"

    try:
        render_timeline_video(redis, job, output_path)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Error rendering timeline job %s: %s", job.job_id, exc)
        update_job(redis, job.job_id, status="FAILED", message="No se pudo combinar los clips")
        if output_path.exists():
            output_path.unlink(missing_ok=True)
        return

    update_job(
        redis,
        job.job_id,
        status="DONE",
        download_url=f"/backend/videos/{job.job_id}.mp4",
        message="Video listo para descarga",
    )


def run_worker() -> None:
    redis = build_redis_client()
    logger.info("Worker iniciado. Escuchando cola %s", QUEUE_NAME)
    while True:
        result = redis.blpop(QUEUE_NAME, timeout=POLL_TIMEOUT)
        if result is None:
            continue
        _, job_id = result
        logger.info("Procesando trabajo %s", job_id)
        process_job(redis, job_id)


if __name__ == "__main__":
    run_worker()
