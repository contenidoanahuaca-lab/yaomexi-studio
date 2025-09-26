import sys
from pathlib import Path
from typing import AsyncIterator

import pytest
import pytest_asyncio

sys.path.append(str(Path(__file__).resolve().parents[2]))

from api.main import (  # noqa: E402
    JOB_KEY_PREFIX,
    CreateTikTokVideoRequest,
    JobStatusResponse,
    create_tiktok_video,
    get_job_status,
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
