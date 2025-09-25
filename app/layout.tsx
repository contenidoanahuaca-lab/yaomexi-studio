import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

const navigation = [
  { href: '/', label: 'Inicio' },
  { href: '/historias', label: 'Historias' },
  { href: '/studio', label: 'Videos' },
  { href: '/impacto', label: 'Impacto' },
  { href: '/nfts', label: 'NFTs' },
  { href: '/comunidad', label: 'Comunidad' },
]

export const metadata: Metadata = {
  title: 'Yaomexicatl Studio',
  description:
    'Creando historias y experiencias digitales que financian la reforestación de especies nativas en México.',
  openGraph: {
    title: 'Yaomexicatl Studio',
    description:
      'Creando historias y experiencias digitales que financian la reforestación de especies nativas en México.',
  },
  twitter: {
    title: 'Yaomexicatl Studio',
    description:
      'Creando historias y experiencias digitales que financian la reforestación de especies nativas en México.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className="bg-neutral-50 text-neutral-900 dark:bg-brand-night dark:text-neutral-50"
    >
      <body className="flex min-h-screen flex-col font-body antialiased">
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-brand-night/80">
          <div className="container-responsive flex items-center justify-between py-4">
            <Link
              href="/"
              className="flex items-center gap-3 font-display text-lg font-semibold text-brand-jade"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-turquoise text-lg text-white">
                YX
              </span>
              <div className="flex flex-col leading-tight">
                <span>Yaomexicatl</span>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-300">
                  Historias que siembran
                </span>
              </div>
            </Link>
            <nav aria-label="Navegación principal">
              <ul className="flex items-center gap-6 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-brand-turquoise focus-visible:text-brand-turquoise"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-brand-night/60">
          <div className="container-responsive grid gap-6 py-10 md:grid-cols-3">
            <div>
              <h2 className="font-display text-lg text-brand-jade">
                Nuestra misión
              </h2>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                Impulsamos historias, cómics y experiencias digitales que honran
                la cultura prehispánica, protegen a los colibríes y financian la
                reforestación de plantas y árboles nativos.
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg text-brand-jade">Síguenos</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
                <li>
                  <a
                    href="https://www.tiktok.com/@yaomexicatl"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-turquoise"
                  >
                    TikTok
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/yaomexicatl"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-turquoise"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-lg text-brand-jade">
                Transparencia
              </h2>
              <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                Cada compra financia plantas y árboles nativos. Pronto podrás
                seguir los reportes de impacto en tiempo real y auditar nuestros
                proyectos de reforestación.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
