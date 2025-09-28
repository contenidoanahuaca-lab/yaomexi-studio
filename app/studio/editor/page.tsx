import type { Metadata } from 'next'

import { EditorClient } from './EditorClient'

export const metadata: Metadata = {
  title: 'Editor de video | Yaomexicatl Studio',
  description:
    'Combina clips y genera videos listos para TikTok con el Mini Estudio web de Yaomexicatl.',
}

export default function EditorPage() {
  return <EditorClient />
}
