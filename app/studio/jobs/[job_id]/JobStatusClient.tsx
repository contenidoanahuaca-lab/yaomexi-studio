'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const POLL_INTERVAL = 4000

const statusLabels: Record<string, string> = {
  QUEUED: 'En cola',
  PROCESSING: 'Generando video',
  DONE: 'Video listo',
  FAILED: 'Error en el procesamiento',
}

type JobStatus = 'QUEUED' | 'PROCESSING' | 'DONE' | 'FAILED'

type JobPayload = {
  job_id: string
  status: JobStatus
  download_url?: string | null
  message?: string | null
  updated_at?: string | null
}

export function JobStatusClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(true)

  useEffect(() => {
    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | undefined

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/backend/jobs/${jobId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError(
              'No encontramos el trabajo solicitado. Verifica el enlace o crea un nuevo video.'
            )
            setIsPolling(false)
            return
          }
          throw new Error(`Error ${response.status}`)
        }
        const payload = (await response.json()) as JobPayload
        if (!isMounted) {
          return
        }
        setJob(payload)
        setError(null)
        if (payload.status === 'DONE' || payload.status === 'FAILED') {
          setIsPolling(false)
        }
      } catch (pollError) {
        console.error('No se pudo obtener el estado del trabajo', pollError)
        if (isMounted) {
          setError(
            'No pudimos conectar con el backend. Intentaremos nuevamente en unos segundos.'
          )
        }
      }
    }

    fetchStatus()
    intervalId = setInterval(fetchStatus, POLL_INTERVAL)

    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [jobId])

  const statusLabel = useMemo(() => {
    if (!job) {
      return 'Obteniendo estado...'
    }
    return statusLabels[job.status] ?? job.status
  }, [job])

  return (
    <section className="bg-neutral-50 pb-24 pt-16 dark:bg-brand-night">
      <div className="container-responsive max-w-3xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
            Progreso del trabajo
          </p>
          <h1 className="font-display text-4xl text-brand-jade">
            Seguimiento de tu video
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Monitoreamos la cola de Yaomexicatl para avisarte cuando el MP4 esté
            listo para descargar y publicar en TikTok.
          </p>
        </header>

        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-lg dark:border-neutral-800 dark:bg-brand-night/70">
          <p className="text-sm font-medium text-brand-gold">Estado</p>
          <p className="mt-2 text-2xl font-semibold text-brand-jade">
            {statusLabel}
          </p>

          {job?.updated_at && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Actualizado: {new Date(job.updated_at).toLocaleString('es-MX')}
            </p>
          )}

          {isPolling && (
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              Actualizando cada {POLL_INTERVAL / 1000} segundos…
            </p>
          )}

          {job?.message && (
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
              {job.message}
            </p>
          )}

          {job?.status === 'DONE' && job.download_url && (
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href={job.download_url}
                className="inline-flex items-center justify-center rounded-full bg-brand-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise focus-visible:bg-brand-turquoise"
              >
                Descargar video MP4
              </Link>
              <Link
                href="/impacto"
                className="inline-flex items-center justify-center rounded-full border border-brand-gold px-6 py-3 text-sm font-semibold text-brand-gold transition hover:border-brand-turquoise hover:text-brand-turquoise focus-visible:border-brand-turquoise"
              >
                Ver impacto logrado
              </Link>
            </div>
          )}

          {job?.status === 'FAILED' && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-brand-red">
                Hubo un problema al generar tu video. Intenta nuevamente o
                contáctanos para acompañarte en el proceso.
              </p>
              <Link
                href="/studio"
                className="inline-flex items-center justify-center rounded-full bg-brand-turquoise px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-jade focus-visible:bg-brand-jade"
              >
                Reintentar creación
              </Link>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-brand-red" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="text-sm text-neutral-500 dark:text-neutral-400">
          ¿Listo para otro experimento creativo?{' '}
          <Link
            href="/studio"
            className="text-brand-turquoise underline-offset-2 hover:underline"
          >
            Volver al Mini Estudio
          </Link>
          .
        </footer>
      </div>
    </section>
  )
}
