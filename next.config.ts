import type { NextConfig } from 'next'
import fs from 'fs'
import path from 'path'

// Read and validate package.json
const packageJsonPath = path.join(process.cwd(), 'package.json')
let version = '0.0.0'

try {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at ${packageJsonPath}`)
  }

  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8')
  const packageJson = JSON.parse(packageJsonContent)

  if (!packageJson.version) {
    throw new Error('version field missing in package.json')
  }

  version = packageJson.version
} catch (error) {
  console.error('[NextConfig] CRITICAL ERROR: Failed to read package.json')
  console.error(error)
  process.exit(1) // Fail hard and fast
}

// Note: MDX files are rendered dynamically via next-mdx-remote in [...]slug/page.tsx
// Do NOT include 'md' or 'mdx' in pageExtensions - they would conflict with dynamic routing
const nextConfig: NextConfig = {
  // Explicitly set to standalone to reduce file scanning
  output: 'standalone',
  // Only standard page file extensions - MDX is handled dynamically
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

export default nextConfig
