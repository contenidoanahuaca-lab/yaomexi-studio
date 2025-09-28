'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']

function createFileFingerprint(file: File): string {
  return [file.name, file.size, file.lastModified].join('::')
}

function formatSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) {
    return '0:00'
  }
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type LocalClip = {
  localId: string
  file: File
  objectUrl: string
  duration?: number
  uploadId?: string
  status: 'uploading' | 'uploaded' | 'error'
  error?: string | null
}

type UploadResponse = {
  upload_id: string
  filename: string
  size: number
}

type JobResponse = {
  job_id: string
}

function createLocalId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

async function extractDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = objectUrl

    const handleLoadedMetadata = () => {
      resolve(video.duration)
      cleanup()
    }

    const handleError = () => {
      reject(new Error('No se pudo leer la duración del video.'))
      cleanup()
    }

    const cleanup = () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('error', handleError)
      video.src = ''
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('error', handleError)
  })
}

export function EditorClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set<string>())
  const [clips, setClips] = useState<LocalClip[]>([])
  const [renderError, setRenderError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)

  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
      objectUrlsRef.current = new Set<string>()
    }
  }, [])

  const totalDuration = useMemo(() => {
    return clips.reduce((sum, clip) => sum + (clip.duration ?? 0), 0)
  }, [clips])

  const handleSelectFiles = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files) {
      return
    }

    const selectedFiles = Array.from(files)
    const filtered = selectedFiles.filter((file) =>
      ACCEPTED_TYPES.includes(file.type)
    )

    const existingFingerprints = new Set(
      clips.map((clip) => createFileFingerprint(clip.file))
    )

    let duplicatesFound = false
    const uniqueFiles = filtered.filter((file) => {
      const fingerprint = createFileFingerprint(file)
      if (existingFingerprints.has(fingerprint)) {
        duplicatesFound = true
        return false
      }

      existingFingerprints.add(fingerprint)
      return true
    })

    const messages: string[] = []
    if (filtered.length !== selectedFiles.length) {
      messages.push(
        'Algunos archivos fueron ignorados por no ser videos compatibles (MP4, MOV o WebM).'
      )
    }

    if (duplicatesFound) {
      messages.push('Algunos videos ya estaban cargados y se omitieron duplicados.')
    }

    setRenderError(messages.length ? messages.join(' ') : null)

    const newClips: LocalClip[] = uniqueFiles.map((file) => {
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.add(objectUrl)
      return {
        localId: createLocalId(),
        file,
        objectUrl,
        status: 'uploading',
      }
    })

    setClips((previous) => [...previous, ...newClips])

    await Promise.all(
      newClips.map(async (clip) => {
        try {
          const duration = await extractDuration(clip.objectUrl)
          setClips((previous) =>
            previous.map((existing) =>
              existing.localId === clip.localId
                ? { ...existing, duration }
                : existing
            )
          )
        } catch (durationError) {
          console.error(durationError)
          setClips((previous) =>
            previous.map((existing) =>
              existing.localId === clip.localId
                ? {
                    ...existing,
                    status: 'error',
                    error: 'No se pudo obtener la duración del archivo.',
                  }
                : existing
            )
          )
          return
        }

        try {
          const formData = new FormData()
          formData.append('file', clip.file)
          const response = await fetch('/backend/editor/uploads', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Error ${response.status}`)
          }

          const payload = (await response.json()) as UploadResponse

          setClips((previous) =>
            previous.map((existing) =>
              existing.localId === clip.localId
                ? {
                    ...existing,
                    uploadId: payload.upload_id,
                    status: 'uploaded',
                    error: null,
                  }
                : existing
            )
          )
        } catch (uploadError) {
          console.error('Error al subir el clip', uploadError)
          setClips((previous) =>
            previous.map((existing) =>
              existing.localId === clip.localId
                ? {
                    ...existing,
                    status: 'error',
                    error:
                      'No se pudo subir el video. Revisa tu conexión e inténtalo de nuevo.',
                  }
                : existing
            )
          )
        }
      })
    )

    event.target.value = ''
  }

  const handleRemoveClip = (localId: string) => {
    setClips((previous) => {
      const clipToRemove = previous.find((clip) => clip.localId === localId)
      if (clipToRemove) {
        URL.revokeObjectURL(clipToRemove.objectUrl)
        objectUrlsRef.current.delete(clipToRemove.objectUrl)
      }
      return previous.filter((clip) => clip.localId !== localId)
    })
  }

  const handleResetError = () => {
    setRenderError(null)
  }

  const handleRender = async () => {
    if (!clips.length) {
      setRenderError('Agrega al menos un video antes de renderizar.')
      return
    }

    const hasErrors = clips.some((clip) => clip.status === 'error')
    if (hasErrors) {
      setRenderError('Elimina o reemplaza los clips con error antes de continuar.')
      return
    }

    const pendingUploads = clips.filter((clip) => clip.status !== 'uploaded')
    if (pendingUploads.length > 0) {
      setRenderError('Espera a que todos los videos terminen de subir.')
      return
    }

    setIsRendering(true)
    setRenderError(null)

    try {
      const response = await fetch('/backend/editor/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clips: clips.map((clip) => ({
            upload_id: clip.uploadId as string,
            duration: clip.duration ?? 0,
          })),
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        const message =
          typeof errorPayload?.detail === 'string'
            ? errorPayload.detail
            : 'No se pudo iniciar el render. Inténtalo más tarde.'
        throw new Error(message)
      }

      const payload = (await response.json()) as JobResponse
      router.push(`/studio/jobs/${payload.job_id}`)
    } catch (error) {
      console.error('Error al renderizar', error)
      setRenderError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al crear el trabajo.'
      )
    } finally {
      setIsRendering(false)
    }
  }

  return (
    <section className="bg-neutral-50 pb-24 pt-16 dark:bg-brand-night">
      <div className="container-responsive max-w-4xl space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
            Editor Yaomexi
          </p>
          <h1 className="font-display text-4xl text-brand-jade md:text-5xl">
            Arma tu video con clips existentes
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Carga videos, ordénalos en una timeline sencilla y genera un MP4
            listo para compartir en TikTok.
          </p>
        </header>

        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-xl shadow-brand-night/10 dark:border-neutral-800 dark:bg-brand-night/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl text-brand-jade">
                Timeline de clips
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Arrastra o selecciona varios archivos de video (MP4, MOV o
                WebM).
              </p>
            </div>
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleSelectFiles}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center rounded-full border border-brand-turquoise px-5 py-2 text-sm font-semibold text-brand-turquoise transition hover:bg-brand-turquoise hover:text-white focus-visible:bg-brand-turquoise focus-visible:text-white"
              >
                Subir videos
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {clips.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-brand-night/50">
                Aún no hay clips en la timeline. Agrega videos para comenzar a
                construir tu historia.
              </p>
            ) : (
              <ul className="space-y-3">
                {clips.map((clip, index) => (
                  <li
                    key={clip.localId}
                    className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white/80 p-4 text-sm text-neutral-700 shadow-sm transition dark:border-neutral-700 dark:bg-brand-night/60 dark:text-neutral-200 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-brand-jade">
                        {index + 1}. {clip.file.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {clip.duration ? `Duración: ${formatSeconds(clip.duration)}` : 'Calculando duración…'}
                      </p>
                      {clip.error && (
                        <p className="text-xs text-brand-red" role="alert">
                          {clip.error}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:border-neutral-600 dark:text-neutral-400">
                        {clip.status === 'uploaded'
                          ? 'Listo'
                          : clip.status === 'uploading'
                          ? 'Subiendo'
                          : 'Error'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClip(clip.localId)}
                        className="inline-flex items-center justify-center rounded-full border border-brand-red px-4 py-1 text-xs font-semibold text-brand-red transition hover:bg-brand-red hover:text-white focus-visible:bg-brand-red focus-visible:text-white"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-brand-night/60 dark:text-neutral-300">
              <p>
                Clips totales: <strong>{clips.length}</strong>
              </p>
              <p>
                Duración estimada:{' '}
                <strong>{formatSeconds(totalDuration)}</strong>
              </p>
            </div>
          </div>

          {renderError && (
            <div
              className="mt-6 rounded-2xl border border-brand-red/40 bg-brand-red/10 p-4 text-sm text-brand-red"
              role="alert"
            >
              <div className="flex items-start justify-between gap-4">
                <p>{renderError}</p>
                <button
                  type="button"
                  onClick={handleResetError}
                  className="text-xs font-semibold uppercase tracking-widest text-brand-red underline-offset-2 hover:underline"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleRender}
              disabled={isRendering || clips.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-brand-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise focus-visible:bg-brand-turquoise disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {isRendering ? 'Renderizando…' : 'Renderizar'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
