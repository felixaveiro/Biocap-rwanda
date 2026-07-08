import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resource & Activities',
  description:
    'BIOCAP Rwanda Resource & Activities and updates — latest insights on biotechnology, sustainable farming, crop innovation, and agricultural science in Rwanda.',
  openGraph: {
    title: 'Resource & Activities | BIOCAP Rwanda',
    description:
      'Latest news and articles from BIOCAP Rwanda on Resource and Activities — biotechnology, crop science, food security, and Rwanda\'s agricultural innovation.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Resource',
  },
}

export default function DnaWeekLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}