import type { NextConfig } from 'next';

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || 'https://biocapapi.afs-rwanda.org';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${API_ORIGIN.replace(/\/+$/, '')}/:path*`,
      },
    ];
  },
  images: {
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pixieset.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/biocap-rwanda/**' },
    ],
  },
};

export default nextConfig;