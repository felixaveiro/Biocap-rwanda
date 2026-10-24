import { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://biocapapi.afs-rwanda.org';
const SITE_URL = 'https://biocap-rwanda.afs-rwanda.org';

async function fetchStoryForMeta(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/public/${slug}`, {
      cache: 'no-store', // Ensures crawlers receive up-to-date metadata
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch blog metadata:', error);
    return null;
  }
}

// 🟢 FIX: `params` is typed as a Promise and unwrapped with `await`
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await fetchStoryForMeta(slug);

  if (!story) {
    return {
      title: 'Stewardship News | BioCap Rwanda',
      description: 'Discover how BioCap Rwanda promotes sustainable agriculture.',
    };
  }

  // Format Cover Image Path to an absolute HTTPS URL
  let coverImage = story.img || '/image/biocap-logo.png';
  if (!coverImage.startsWith('http://') && !coverImage.startsWith('https://')) {
    coverImage = `${SITE_URL}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
  }
  coverImage = coverImage.replace('http://', 'https://');

  const pageUrl = `${SITE_URL}/Stewardship-News/${slug}`;
  const cleanTitle = story.title?.trim() || 'Stewardship News | BioCap Rwanda';
  const cleanExcerpt = story.excerpt?.trim() || cleanTitle;

  const imageType = coverImage.endsWith('.png')
    ? 'image/png'
    : coverImage.endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';

  return {
    title: cleanTitle,
    description: cleanExcerpt,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: cleanTitle,
      description: cleanExcerpt,
      url: pageUrl,
      siteName: 'BioCap Rwanda',
      type: 'article',
      images: [
        {
          url: coverImage,
          secureUrl: coverImage, // Required for WhatsApp Web
          width: 1200,
          height: 630,
          type: imageType,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanExcerpt,
      images: [coverImage],
    },
  };
}

export default function StewardshipArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}