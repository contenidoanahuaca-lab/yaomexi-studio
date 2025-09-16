# Yaomexi Studio MVP

This repository contains a minimal MVP for **Yaomexi Studio**. It consists of a small API built with FastAPI for accepting tasks and a background worker for processing them asynchronously using Redis as the broker. The project includes a Docker Compose configuration, example environment variables, a Postman collection, and a GitHub Actions workflow for continuous integration.

## Requirements

- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- Python 3.10+ (only needed if running without Docker)

## Setup

1. Clone the repository and change into its directory.
2. Copy `.env.example` to `.env` and adjust values if necessary.
3. Build and run the entire stack with Docker Compose:

   ```bash
   docker-compose up --build
   ```

   This command starts three services:
   - `api` – the FastAPI application, listening on port 8000.
   - `worker` – a simple Python script that consumes and processes tasks from Redis.
   - `redis` – the message broker used by both services.

## Usage

Send a POST request to queue a task:

```bash
curl -X POST http://localhost:8000/tasks \
     -H "Content-Type: application/json" \
     -d '{"name": "demo", "payload": "example"}'
```

Check how many tasks are queued:

```bash
curl http://localhost:8000/tasks/count
```

You can observe the worker processing tasks by viewing the logs of the `worker` container or the console output if running locally.

## Development without Docker

If you prefer to run the services locally without Docker:

```bash
# Start Redis separately or adjust REDIS_HOST and REDIS_PORT

# Run the API
cd api
pip install -r requirements.txt
uvicorn app:app --reload

# In a second terminal, run the worker
cd ../worker
pip install -r requirements.txt
python worker.py
```

Ensure a Redis instance is available and reachable by both services.

## Postman Collection

The `postman_collection.json` file contains two requests: one for enqueuing a new task and one for retrieving the current queue length. Import it into Postman and update the `base_url` variable if necessary (defaults to `http://localhost:8000`).

## Continuous Integration

A GitHub Actions workflow is defined in `.github/workflows/ci.yml`. On every push or pull request to the `main` branch it will:

1. Check out the code.
2. Set up Python.
3. Install the API and worker dependencies.
4. Run a basic flake8 linting step.
5. Perform a simple health‑check on the API by starting it with `uvicorn` and making a request to `/`.

You can extend this workflow to run unit tests, build Docker images, or deploy the stack as your project evolves.

---

This MVP is intentionally simple so you can evolve it to suit your needs. Feel free to add more endpoints, integrate a proper job queue like Celery or RQ, and implement real task processing logic in the worker.