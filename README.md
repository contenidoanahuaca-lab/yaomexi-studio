# Yaomexi Studio

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
```

Servicios disponibles:

- UI: http://localhost:3000
- API: http://localhost:8000 (documentación automática en `/docs`)
- Redis: localhost:6379 (solo si necesitas inspeccionar la cola)

Los videos renderizados se guardan en el volumen `videos` compartido entre API y worker.

## Desarrollo manual

1. **UI**
   ```bash
   npm install
   npm run dev
   ```
2. **API**
   ```bash
   cd api
   pip install -r requirements.txt
   uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. **Worker**
   ```bash
   cd worker
   pip install -r requirements.txt
   python worker.py
   ```

Configura `REDIS_URL`, `QUEUE_NAME` y `VIDEOS_DIR` si necesitas entornos personalizados.

## Validaciones (Windows PowerShell 7)

```powershell
npm run lint
pytest
pre-commit run --all-files
```

## URLs clave

- UI: http://localhost:3000
- Crear video: http://localhost:3000/studio
- Seguimiento de jobs: http://localhost:3000/studio/jobs/{job_id}
- API docs: http://localhost:8000/docs

## Transparencia

Cada compra de productos digitales financia plantas y árboles nativos. El footer del sitio enlaza a TikTok e Instagram para seguir los reportes de impacto.
