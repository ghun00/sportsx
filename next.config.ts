import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Firebase Functions 폴더를 Next.js 빌드에서 제외
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {
    // Firebase Functions 폴더 무시
    outputFileTracingExcludes: {
      '*': ['./functions/**/*'],
    },
  },
};

export default nextConfig;
