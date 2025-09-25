'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  { id: 1, title: 'Plantilla' },
  { id: 2, title: 'Guion' },
  { id: 3, title: 'Voz y música' },
]

const voices = [
  { value: 'voz-femenina', label: 'Voz femenina cálida (español latino)' },
  { value: 'voz-masculina', label: 'Voz masculina serena (español latino)' },
  {
    value: 'instrumental',
    label: 'Solo música ambiental con sonidos de naturaleza',
  },
]

const MIN_SCRIPT_LENGTH = 50

export function CreateTikTokVideoForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState('tiktok-vertical')
  const [script, setScript] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = useMemo(
    () => (currentStep / steps.length) * 100,
    [currentStep]
  )

  const canAdvance = useMemo(() => {
    if (currentStep === 1) {
      return Boolean(selectedTemplate)
    }
    if (currentStep === 2) {
      return script.trim().length >= MIN_SCRIPT_LENGTH
    }
    return Boolean(selectedVoice)
  }, [currentStep, script, selectedTemplate, selectedVoice])

  const handleNext = () => {
    if (!canAdvance) {
      setFormError('Completa la información requerida antes de continuar.')
      return
    }
    setFormError(null)
    setCurrentStep((previous) => Math.min(previous + 1, steps.length))
  }

  const handlePrevious = () => {
    setFormError(null)
    setCurrentStep((previous) => Math.max(previous - 1, 1))
  }

  const handleAutoGenerate = () => {
    console.info('stub')
    setFormError(
      'Generador automático disponible próximamente. Redacta tu guion manualmente por ahora.'
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canAdvance || isSubmitting) {
      setFormError('Revisa la información antes de enviar tu historia.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const response = await fetch('/backend/videos/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          script,
          voice: selectedVoice,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        const message =
          errorPayload?.detail ??
          'No se pudo crear el trabajo. Intenta de nuevo.'
        setFormError(message)
        return
      }

      const payload = await response.json()
      router.push(`/studio/jobs/${payload.job_id}`)
    } catch (error) {
      console.error('Error al crear el video', error)
      setFormError(
        'Ocurrió un error de red. Intenta nuevamente en unos segundos.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={handleSubmit} noValidate>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-2 rounded-full bg-brand-turquoise transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                currentStep === step.id
                  ? 'border-brand-turquoise bg-brand-turquoise text-white'
                  : 'border-neutral-300 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-transparent'
              }`}
              aria-current={currentStep === step.id ? 'step' : undefined}
            >
              {step.id}
            </span>
            <span>{step.title}</span>
          </li>
        ))}
      </ol>

      {currentStep === 1 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-brand-jade">
            Selecciona una plantilla
          </legend>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Lanzamos el formato TikTok 9:16 de 60 segundos para amplificar
            historias que cuidan colibríes y bosques.
          </p>
          <label
            className={`flex cursor-pointer flex-col gap-2 rounded-2xl border p-6 transition focus-within:ring-2 focus-within:ring-brand-gold focus-within:ring-offset-2 dark:border-neutral-700 ${
              selectedTemplate === 'tiktok-vertical'
                ? 'border-brand-turquoise bg-brand-turquoise/10'
                : 'border-neutral-200 bg-white/70 dark:bg-brand-night/60'
            }`}
          >
            <input
              type="radio"
              name="template"
              value="tiktok-vertical"
              checked={selectedTemplate === 'tiktok-vertical'}
              onChange={(event) => setSelectedTemplate(event.target.value)}
              className="sr-only"
            />
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
              TikTok
            </span>
            <span className="font-display text-xl text-brand-jade">
              Formato vertical 9:16
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
              Duración estimada: 60 segundos.
            </span>
          </label>
        </fieldset>
      )}

      {currentStep === 2 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-brand-jade">
            Construye tu guion
          </legend>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Describe escenas que conecten cultura prehispánica, biodiversidad y
            el llamado a reforestar.
          </p>
          <textarea
            required
            value={script}
            onChange={(event) => setScript(event.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-neutral-200 bg-white/80 p-4 text-sm text-neutral-800 shadow-sm transition focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-gold dark:border-neutral-700 dark:bg-brand-night/60 dark:text-neutral-100"
            placeholder="Introduce la leyenda del colibrí mensajero, explica su rol como polinizador y cierra con la invitación a apoyar la reforestación."
            aria-describedby="script-hint"
          />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="rounded-full border border-brand-turquoise px-5 py-2 font-semibold text-brand-turquoise transition hover:bg-brand-turquoise hover:text-white focus-visible:bg-brand-turquoise focus-visible:text-white"
            >
              Auto-generar
            </button>
            <p
              id="script-hint"
              className="text-neutral-500 dark:text-neutral-400"
            >
              Recomendamos al menos {MIN_SCRIPT_LENGTH} caracteres para mantener
              una narrativa clara.
            </p>
          </div>
        </fieldset>
      )}

      {currentStep === 3 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-brand-jade">
            Selecciona voz o música
          </legend>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Define el estilo sonoro para reforzar la emoción de tu historia.
          </p>
          <label
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-200"
            htmlFor="voice"
          >
            Voz narrativa
          </label>
          <select
            id="voice"
            required
            value={selectedVoice}
            onChange={(event) => setSelectedVoice(event.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white/80 px-4 py-3 text-sm text-neutral-800 shadow-sm transition focus:border-brand-turquoise focus:outline-none focus:ring-2 focus:ring-brand-gold dark:border-neutral-700 dark:bg-brand-night/60 dark:text-neutral-100"
          >
            <option value="" disabled>
              Selecciona una voz
            </option>
            {voices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-brand-jade px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-turquoise focus-visible:bg-brand-turquoise disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enviando…' : 'Enviar'}
          </button>
        </fieldset>
      )}

      {formError && (
        <p className="text-sm text-brand-red" role="alert">
          {formError}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isSubmitting}
          className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-600 transition hover:border-brand-turquoise hover:text-brand-turquoise disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
        >
          Atrás
        </button>
        {currentStep < steps.length && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance}
            className="inline-flex items-center justify-center rounded-full bg-brand-turquoise px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-jade focus-visible:bg-brand-jade disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continuar
          </button>
        )}
      </div>
    </form>
  )
}
