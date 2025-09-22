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
  // Next.js 15.5.3에서는 outputFileTracingExcludes가 최상위 레벨로 이동
  outputFileTracingExcludes: {
    '*': ['./functions/**/*'],
  },
};

export default nextConfig;
