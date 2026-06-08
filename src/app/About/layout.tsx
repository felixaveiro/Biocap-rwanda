import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about BIOCAP Rwanda — a flagship initiative building Rwandan capacity for accelerated development, deregulation, and deployment of enhanced crops launched December 2025.',
  openGraph: {
    title: 'About Us | BIOCAP Rwanda',
    description: 'Learn about BIOCAP Rwanda — building local scientific expertise to develop climate-resilient crops for Rwandan farmers.',
    url: 'https://biocap-rwanda.afs-rwanda.org/About',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}