import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Explicitly set to standalone to reduce file scanning
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

export default nextConfig
