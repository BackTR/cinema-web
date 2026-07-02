import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' }, // Rekomendasi: ubah ke domain CDN yang spesifik
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // fallback untuk sementara agar tidak memecahkan poster yang ada
      { protocol: 'https', hostname: '**' }, 
    ],
  },
};


export default nextConfig;