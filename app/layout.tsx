import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

const navigation = [
  { href: '/',          label: 'Inicio' },
  { href: '/historias', label: 'Historias' },
  { href: '/studio',    label: 'Videos' },
  { href: '/impacto',   label: 'Impacto' },
  { href: '/nfts',      label: 'NFTs' },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              <ul className="flex items-center gap-6 text-sm font-medium

