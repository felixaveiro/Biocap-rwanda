import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stewardship News',
  description:
    'BIOCAP Rwanda\'s environmental commitment — sustainable agriculture through biotech crops that reduce chemical use, regenerate soil, and build climate resilience for Rwandan farmers.',
  openGraph: {
    title: 'Stewardship News | BIOCAP Rwanda',
    description:
      'Discover how BIOCAP Rwanda promotes sustainable agriculture — stronger crops, reduced pesticides, and climate-resilient farming across Rwanda\'s agro-ecological zones.',
    url: 'https://biocap-rwanda.afs-rwanda.org/Stewardship-News',
  },
}

export default function EnvironmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}