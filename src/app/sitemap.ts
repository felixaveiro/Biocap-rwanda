import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://biocap-rwanda.afs-rwanda.org', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/About', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Objectives', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Biotech', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Milestones', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Environment', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Gallery', lastModified: new Date() },
    { url: 'https://biocap-rwanda.afs-rwanda.org/Dna-week', lastModified: new Date() },
  ]
}