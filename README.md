# Yaomexi Studio — Web (UI)

Interfaz Next.js + TypeScript + Tailwind para crear **1 video piloto** y consultar el estado de **jobs** del backend.

## Requisitos
- Node 18+
- Docker (si usarás `docker compose`)

## Variables de entorno
Copia `.env.example` a `.env.local` y ajusta según tu entorno:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK=true
```

> **Mock**: si `NEXT_PUBLIC_USE_MOCK=true`, la UI simula `POST /jobs` y `GET /jobs/{id}` (progreso y un MP4 de prueba). Úsalo si el backend aún no expone esos endpoints.

## Scripts
- `npm run dev` — desarrollo en `http://localhost:3000`
- `npm run build` — compilación
- `npm start` — modo producción

## Docker
```
docker build -t yaomexi-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 yaomexi-web
```

## Páginas
- `/` — formulario (guion, imágenes por archivo o URL, voz, duración) → crea **un** job.
- `/jobs/[id]` — progreso `queued|running|done|error` + enlace de descarga al terminar.
- `/salud` — resultado de `GET /health`.

## Notas
- Valida guion y al menos una imagen (archivo o URL).
- Evita múltiples jobs: el botón se desactiva durante el envío.
- Estilo básico consistente con Yaomexicatl (colores/tipografía).
