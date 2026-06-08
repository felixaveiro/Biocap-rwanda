import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'BIOCAP Rwanda photo gallery — documenting Rwanda\'s biotech agriculture journey from laboratory research and confined field trials to community engagement and farmer outreach.',
  openGraph: {
    title: 'Gallery | BIOCAP Rwanda',
    description:
      'Browse BIOCAP Rwanda\'s photo collections — field trials, lab science, stakeholder engagement, and crop development across Rwanda.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Gallery',
  },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}