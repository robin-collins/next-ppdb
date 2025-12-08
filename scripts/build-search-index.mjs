// scripts/build-search-index.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { remark } from 'remark'
import strip from 'strip-markdown'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'app', 'docs')
const OUTPUT_FILE = path.join(__dirname, '..', 'public', 'search-index.json')

/**
 * Recursively scan directory for MDX files
 */
function scanDirectory(dir, baseUrl = '/docs') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const results = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Recursively scan subdirectories
      const subUrl = `${baseUrl}/${entry.name}`
      results.push(...scanDirectory(fullPath, subUrl))
    } else if (entry.isFile() && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
      // Skip layout.tsx and other non-content files
      if (entry.name === 'layout.tsx' || entry.name === 'layout.ts') continue

      // Determine URL based on file name
      let url = baseUrl
      
      if (entry.name === 'page.mdx' || entry.name === 'page.md') {
        // Index file for this directory
        url = baseUrl
      } else {
        // Regular file: architecture.mdx -> /docs/architecture
        const slug = entry.name.replace(/\.(mdx?|md)$/, '')
        url = `${baseUrl}/${slug}`
      }

      results.push({
        path: fullPath,
        url: url,
      })
    }
  }

  return results
}

async function generateIndex() {
  console.log('🔍 Building search index...')
  
  const files = scanDirectory(CONTENT_DIR)
  const index = []

  for (const file of files) {
    try {
      const fileContents = fs.readFileSync(file.path, 'utf8')
      const { data, content } = matter(fileContents)

      // Strip Markdown to get plain text for better search indexing
      const processedContent = await remark().use(strip).process(content)
      const plainText = processedContent.toString().trim()

      // Only index if there's actual content
      if (plainText.length > 0) {
        index.push({
          url: file.url,
          title: data.title || 'Untitled',
          description: data.description || '',
          content: plainText.substring(0, 1000), // Limit content length for performance
        })
      }
    } catch (error) {
      console.error(`Error processing ${file.path}:`, error.message)
    }
  }

  // Ensure public directory exists
  const publicDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2))
  console.log(`✅ Search index generated with ${index.length} documents.`)
  console.log(`📝 Output: ${OUTPUT_FILE}`)
}

generateIndex().catch(console.error)
