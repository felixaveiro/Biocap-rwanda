import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DNA Week News',
  description:
    'BIOCAP Rwanda DNA Week news and updates — latest insights on biotechnology, sustainable farming, crop innovation, and agricultural science in Rwanda.',
  openGraph: {
    title: 'DNA Week News | BIOCAP Rwanda',
    description:
      'Latest news and articles from BIOCAP Rwanda on DNA Week — biotechnology, crop science, food security, and Rwanda\'s agricultural innovation.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Dna-week',
  },
}

export default function DnaWeekLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}