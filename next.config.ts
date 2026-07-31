import type { NextConfig } from 'next';
import path from 'path';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  // 将 /api/* 代理到统一后端 lakeli-app-xc
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
