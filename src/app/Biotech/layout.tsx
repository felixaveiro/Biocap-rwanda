import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Biotechnology',
  description: 'Explore BIOCAP Rwanda\'s biotech crops — Cassava, Potato, and Banana with REMA-approved environmental release. CRISPR and gene-editing innovations for Rwandan farmers.',
  openGraph: {
    title: 'Biotechnology | BIOCAP Rwanda',
    description: 'Cassava, Potato and Banana biotech crops approved by REMA September 2025. Discover how BIOCAP Rwanda uses CRISPR and gene editing for food security.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Biotech',
  },
}

export default function BiotechLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}