"""
Yaomexi Studio Worker

This worker listens to a Redis list (queue) for incoming tasks and processes
them one by one. It runs an infinite loop blocking on `BLPOP` to wait for
tasks. When a task is retrieved it is deserialized and passed to
`process_task()`, where custom task handling logic can be implemented.
"""

import json
import os
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
QUEUE_NAME = os.getenv("QUEUE_NAME", "yaomexi_tasks")


def process_task(task_data):
    """Placeholder for actual task processing logic.

    Args:
        task_data: Deserialized representation of the task payload.
    """
    # In a real application this function might send emails, perform
    # long‑running computations, call external APIs, etc. Here we simply
    # print the task to the console.
    print("Processing task:", task_data)


def main() -> None:
    """Entry point for the worker. Connects to Redis and processes tasks."""
    client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    print("Worker started. Waiting for tasks in queue '{}'.".format(QUEUE_NAME))
    while True:
        # BLPOP blocks until a task is available
        result = client.blpop(QUEUE_NAME)
        if result:
            _, task_json = result
            try:
                task = json.loads(task_json)
            except json.JSONDecodeError:
                task = task_json
            process_task(task)


if __name__ == "__main__":
    main()