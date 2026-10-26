import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
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