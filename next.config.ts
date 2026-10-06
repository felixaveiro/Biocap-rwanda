import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pixieset.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/biocap-rwanda/**' },
    ],
  },
  eslint: {
    // Allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to complete even if type warnings/errors exist
    ignoreBuildErrors: true,
  },
};

export default nextConfig;