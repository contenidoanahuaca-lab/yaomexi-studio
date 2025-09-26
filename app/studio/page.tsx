import type { Metadata } from 'next'
import Link from 'next/link'

import { BadgeImpact } from '../../components/BadgeImpact'
import { CreateTikTokVideoForm } from './CreateTikTokVideoForm'

export const metadata: Metadata = {
  title: 'Mini Estudio | Yaomexicatl Studio',
  description:
    'Activa el estudio web de Yaomexicatl para producir videos de TikTok que financian reforestación en México.',
}

export default function StudioPage() {
  return (
    <section className="bg-neutral-50 pb-24 pt-16 dark:bg-brand-night">
      <div className="container-responsive grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <BadgeImpact />
          <h1 className="font-display text-4xl text-brand-jade md:text-5xl">
            Diseña videos que protegen colibríes y siembran futuro
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Conecta plantillas narrativas con guiones y voces alineadas a la
            estrategia Yaomexicatl. Cada creación apoya la reforestación de
            especies nativas.
          </p>
          <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-brand-night/50">
            <h2 className="font-display text-2xl text-brand-jade">
              ¿Qué obtendrás?
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              <li>• Guiones listos para TikTok 9:16 de 60 segundos.</li>
              <li>
                • Voces o música que refuerzan la cultura y la acción climática.
              </li>
              <li>• Video MP4 descargable para publicar directamente.</li>
            </ul>
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-gold">
              Transparencia: cada venta financia plantas y árboles nativos.
            </p>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            ¿Buscas inspiración? Explora nuestras{' '}
            <Link
              href="/historias"
              className="text-brand-turquoise underline-offset-2 hover:underline"
            >
              historias destacadas
            </Link>{' '}
            y amplifica su impacto en redes sociales.
          </p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white/90 p-8 shadow-xl shadow-brand-night/10 dark:border-neutral-800 dark:bg-brand-night/70">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-gold">
              Crear video de TikTok
            </p>
            <h2 className="font-display text-3xl text-brand-jade">
              Mini Estudio Web
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Completa los pasos para generar tu video en cuestión de minutos.
              Puedes regresar y editar antes de enviar.
            </p>
          </header>
          <CreateTikTokVideoForm />
        </div>
      </div>
    </section>
  )
}
