import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Milestones',
  description: 'Track BIOCAP Rwanda\'s programme milestones — from Rwanda\'s first-ever REMA approval of biotech food crops in September 2025 to phase-by-phase progress across all districts.',
  openGraph: {
    title: 'Milestones | BIOCAP Rwanda',
    description: 'BIOCAP Rwanda programme milestones — REMA approved Cassava, Potato and Banana environmental release September 2025. Tracking Rwanda\'s agricultural biotechnology progress.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Milestones',
  },
}

export default function MilestonesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}