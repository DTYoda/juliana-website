import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Allow local uploads during development (if any remain)
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Enable image optimization
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Reduce bundle size
  experimental: {
    optimizePackageImports: ['date-fns', '@tiptap/react', '@tiptap/starter-kit'],
  },
};

export default nextConfig;
