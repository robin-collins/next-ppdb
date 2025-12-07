import type { NextConfig } from 'next'
import fs from 'fs'
import path from 'path'

import createMDX from '@next/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

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
  console.log(`[NextConfig] Loaded version ${version} from package.json`)
} catch (error) {
  console.error('[NextConfig] CRITICAL ERROR: Failed to read package.json')
  console.error(error)
  process.exit(1) // Fail hard and fast
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
  },
})

const nextConfig: NextConfig = {
  // Explicitly set to standalone to reduce file scanning
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
}

export default withMDX(nextConfig)
