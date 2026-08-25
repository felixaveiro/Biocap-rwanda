// Stewardship-News/[slug]/layout.tsx
import { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://biocap-rwanda.afs-rwanda.org';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/public/${slug}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) return { title: 'Stewardship News | BioCap' };
    const story = await res.json();

    const siteUrl = 'https://biocap-rwanda.afs-rwanda.org';
    const coverImage = story.img
      ? story.img.startsWith('http')
        ? story.img
        : `${siteUrl}${story.img}`
      : `${siteUrl}/image/biocap-logo.png`;

    return {
      title: story.title,
      description: story.excerpt || 'Read full stewardship news on BioCap Rwanda',
      openGraph: {
        title: story.title,
        description: story.excerpt,
        url: `${siteUrl}/Stewardship-News/${slug}`,
        siteName: 'BioCap Rwanda',
        images: [{ url: coverImage, width: 1200, height: 630 }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: story.title,
        description: story.excerpt,
        images: [coverImage],
      },
    };
  } catch (e) {
    return { title: 'Stewardship News | BioCap' };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}