import type { Metadata } from 'next'

import { JobStatusClient } from './JobStatusClient'

export const metadata: Metadata = {
  title: 'Progreso de video | Yaomexicatl Studio',
  description:
    'Consulta el estado de tu video generado en el Mini Estudio Web de Yaomexicatl.',
}

export default function JobStatusPage({
  params,
}: {
  params: { job_id: string }
}) {
  return <JobStatusClient jobId={params.job_id} />
}
