import sys
from io import BytesIO
from pathlib import Path
from typing import AsyncIterator

import pytest
import pytest_asyncio
from starlette.datastructures import UploadFile

sys.path.append(str(Path(__file__).resolve().parents[2]))

from api.main import (  # noqa: E402
    JOB_KEY_PREFIX,
    UPLOAD_KEY_PREFIX,
    CreateTikTokVideoRequest,
    CreateTimelineJobRequest,
    JobStatusResponse,
    TimelineClip,
    create_tiktok_video,
    create_timeline_job,
    get_job_status,
    upload_editor_clip,
)


@pytest_asyncio.fixture()
async def fake_redis() -> AsyncIterator[object]:
    import fakeredis.aioredis

    client = fakeredis.aioredis.FakeRedis(decode_responses=True)
    try:
        yield client
    finally:
        await client.flushall()
        await client.aclose()


@pytest.mark.asyncio()
async def test_create_and_poll_job(fake_redis):
    payload = CreateTikTokVideoRequest(
        template="tiktok-vertical",
        script="Una historia que honra a los colibríes y protege los bosques nativos de México."
        * 2,
        voice="voz-femenina",
    )

    response = await create_tiktok_video(payload, redis=fake_redis)
    assert response.status == "QUEUED"
    job_id = response.job_id

    job_key = f"{JOB_KEY_PREFIX}{job_id}"
    await fake_redis.hset(
        job_key,
        mapping={
            "status": "DONE",
            "download_url": f"/backend/videos/{job_id}.mp4",
            "updated_at": "2024-01-01T00:00:00+00:00",
        },
    )

    job_status = await get_job_status(job_id, redis=fake_redis)
    assert isinstance(job_status, JobStatusResponse)
    assert job_status.status == "DONE"
    assert job_status.download_url and job_status.download_url.endswith(f"{job_id}.mp4")


@pytest.mark.asyncio()
async def test_upload_clip_and_create_timeline_job(tmp_path, fake_redis, monkeypatch):
    from api import main as api_main  # noqa: WPS433

    monkeypatch.setattr(api_main, "UPLOADS_DIR", tmp_path)

    clip_file = UploadFile(filename="clip.mp4", file=BytesIO(b"fake-video"))
    upload_response = await upload_editor_clip(file=clip_file, redis=fake_redis)

    assert upload_response.upload_id

    stored_clip = await fake_redis.hgetall(f"{UPLOAD_KEY_PREFIX}{upload_response.upload_id}")
    assert stored_clip.get("path")

    payload = CreateTimelineJobRequest(
        clips=[TimelineClip(upload_id=upload_response.upload_id, duration=2.5)]
    )

    job_response = await create_timeline_job(payload, redis=fake_redis)
    assert job_response.status == "QUEUED"

    job_key = f"{JOB_KEY_PREFIX}{job_response.job_id}"
    job_data = await fake_redis.hgetall(job_key)
    assert job_data.get("job_type") == "timeline"
    assert job_data.get("clips")
