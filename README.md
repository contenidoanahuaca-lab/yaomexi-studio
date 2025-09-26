# Yaomexicatl Studio

Mini Estudio Web para generar videos verticales que financian la reforestación de especies nativas en México. La plataforma se compone de una UI en Next.js, un backend FastAPI y un worker de MoviePy que renderiza los MP4.

## Arquitectura

- **ui**: Next.js (App Router) con Tailwind. Proxy `/backend/*` hacia el API.
- **api**: FastAPI + Redis para orquestar la cola de trabajos y exponer descargas de video.
- **worker**: proceso Python que consume la cola, genera clips 9:16 (ColorClip) y actualiza el estado en Redis.
- **redis**: cola de trabajos y almacenamiento de metadatos.

## Requisitos

- Node.js 18+
- Python 3.11+
- Docker 24+ y Docker Compose v2 (opcional, recomendado)

## Puesta en marcha rápida (Docker Compose)

```bash
docker compose up --build
