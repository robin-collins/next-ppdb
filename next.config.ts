import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Explicitly set to standalone to reduce file scanning
  output: 'standalone',
}

export default nextConfig
