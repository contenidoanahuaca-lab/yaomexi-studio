"""
Yaomexi Studio API

This FastAPI application exposes two endpoints:

* `GET /` – returns a simple health message.
* `POST /tasks` – accepts a JSON payload representing a task and queues it in Redis.
* `GET /tasks/count` – returns the number of queued tasks.

Tasks are stored in a Redis list under a configurable name. A separate worker
process (see `worker/worker.py`) will consume and process tasks from the same queue.
"""

from fastapi import FastAPI
import json
import os
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUEUE_NAME = os.getenv("QUEUE_NAME", "yaomexi_tasks")

def get_redis_client() -> redis.Redis:
    """Create and return a Redis client configured for this service."""
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

app = FastAPI(title="Yaomexi Studio API", version="0.1.0")


@app.get("/")
async def read_root() -> dict:
    """Health check endpoint returning a simple status message."""
    return {"message": "Yaomexi Studio API running"}


@app.post("/tasks")
async def create_task(task: dict) -> dict:
    """Accept a task payload and enqueue it in Redis.

    The request body should be a JSON object. It will be serialized and pushed
    onto a Redis list. Returns a confirmation status.
    """
    client = get_redis_client()
    client.rpush(QUEUE_NAME, json.dumps(task))
    return {"status": "task queued"}


@app.get("/tasks/count")
async def tasks_count() -> dict:
    """Return the current number of tasks waiting in the queue."""
    client = get_redis_client()
    count = client.llen(QUEUE_NAME)
    return {"queued": count}