import Link from 'next/link'
import { BadgeImpact } from '../components/BadgeImpact'

const storytellingThemes = [
  {
    title: 'Mitos y leyendas',
    description:
      'Rescatamos relatos ancestrales y los transformamos en narrativas modernas que inspiran a las nuevas generaciones.',
  },
  {
    title: 'Colibríes y polinizadores',
    description:
      'Creamos contenidos que celebran a los guardianes del equilibrio ecológico y promueven su conservación.',
  },
  {
    title: 'Cultura y cuidado ambiental',
    description:
      'Conectamos tradiciones prehispánicas con acciones actuales para proteger bosques y selvas de México.',
  },
]

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-night via-brand-night/95 to-neutral-100 text-neutral-50 dark:from-brand-night dark:via-brand-night">
        <div className="container-responsive flex flex-col gap-10 py-20 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <BadgeImpact />
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Historias de México que siembran futuro
            </h1>
            <p className="max-w-xl text-lg text-neutral-100/90">
              Crea videos gratis para TikTok y pronto para YouTube; apoya reforestación con cada
              producto digital.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center rounded-full bg-brand-turquoise px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-turquoise/30 transition hover:bg-brand-jade focus-visible:bg-brand-jade"
              >
                Abrir Mini Estudio
              </Link>
              <Link
                href="/impacto"
                className="inline-flex items-center justify-center rounded-full border border-brand-gold px-6 py-3 text-sm font-semibold text-brand-gold transition hover:border-brand-turquoise hover:text-brand-turquoise focus-visible:border-brand-turquoise"
              >
                Ver impacto
              </Link>
            </div>
          </div>

          <div className="flex-1 rounded-3xl bg-white/10 p-8 backdrop-blur-lg shadow-xl shadow-brand-night/20">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-gold">Estrategia Yaomexicatl</p>
            <p className="mt-4 text-lg text-neutral-50/90">
              Cultura prehispánica, colibríes y reforestación se unen para crear una comunidad
              creativa que financia bosques nativos mediante cómics, videos, NFTs y transparencia
              radical.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="como-funciona" className="bg-neutral-50 dark:bg-brand-night">
        <div className="container-responsive space-y-10">
          <div className="max-w-2xl">
            <h2 id="como-funciona" className="font-display text-3xl text-brand-jade">
              ¿Cómo funciona?
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Diseñamos una experiencia rápida para que tus contenidos inspiren acción climática en
              cuestión de minutos.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {['Elige plantilla', 'Genera guion/voz', 'Publica y apoya'].map((step, index) => (
              <li
                key={step}
                className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-brand-night/60"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-turquoise text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="font-display text-xl text-brand-jade">{step}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {index === 0 && 'Selecciona la historia visual ideal para TikTok o Reels.'}
                  {index === 1 && 'Recibe un guion y voz listos para grabar o animar tu video.'}
                  {index === 2 && 'Publica, comparte y destina las ganancias a la reforestación.'}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="tematicas" className="bg-white dark:bg-brand-night/80">
        <div className="container-responsive space-y-8">
          <div className="max-w-2xl">
            <h2 id="tematicas" className="font-display text-3xl text-brand-jade">
              Temáticas que inspiran
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Nuestra biblioteca digital honra la biodiversidad y la memoria de los pueblos
              originarios de México.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {storytellingThemes.map((theme) => (
              <article
                key={theme.title}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-brand-night/50"
              >
                <h3 className="font-display text-xl text-brand-jade">{theme.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{theme.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

