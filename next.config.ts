/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pixieset.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/biocap-rwanda/**' },
    ],
  },
};
export default nextConfig;