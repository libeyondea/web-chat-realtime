import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' }
    ]
  },
  experimental: {
    typedRoutes: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
