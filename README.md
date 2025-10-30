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

## API de fulfillment (FastAPI)

En `app/main.py` se define un servicio FastAPI minimal con el endpoint `POST /fulfill-yaomi`.
Este endpoint espera un JSON con `email` (correo de destino) y `productId` (ID del producto) y envía un enlace de descarga al correo usando la API de Resend.

### Cómo ejecutar localmente

1. Instala las dependencias:

```bash
pip install -r requirements.txt
```

2. Define la variable de entorno `RESEND_API_KEY` con tu clave de Resend.

3. Ejecuta el servidor:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

### Despliegue en Render

Se incluye un archivo `render.yaml` con la configuración mínima para desplegar este servicio en Render como tipo `web`. Render instalará las dependencias y arrancará Uvicorn con el comando anterior.
