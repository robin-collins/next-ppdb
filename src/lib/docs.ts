import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocNode {
  title: string
  href: string
  items?: DocNode[]
  order?: number // For sorting
}

const DOCS_DIR = path.join(process.cwd(), 'src/app/docs')

export async function getDocsTree(): Promise<DocNode[]> {
  // If docs dir doesn't exist, return empty
  if (!fs.existsSync(DOCS_DIR)) {
    return []
  }

  const rootItems = await scanDirectory(DOCS_DIR, '/docs')

  // Sort items: directories/sections first, then files
  // Inside those groups, sort by 'order' frontmatter if available, else alpha
  return sortDocs(rootItems)
}

async function scanDirectory(
  dir: string,
  urlPrefix: string
): Promise<DocNode[]> {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const nodes: DocNode[] = []

  for (const entry of entries) {
    // Ignore layout.tsx, page.tsx (unless it's the root docs page which we handle specially or ignore)
    // We typically want to find .mdx files
    // But wait, in App Router:
    // /docs/page.mdx -> /docs
    // /docs/auth/page.mdx -> /docs/auth
    // /docs/auth.mdx is NOT standard App router structure usually, but with @next/mdx pageExtensions it IS supported if configured.

    // We configured pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']
    // So /docs/intro.mdx -> /docs/intro

    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Recurse
      const childUrlPrefix = `${urlPrefix}/${entry.name}`
      const children = await scanDirectory(fullPath, childUrlPrefix)

      // If folder has children, add it as a section
      // Try to find an index/page file to get the section title?
      // Or just capitalize the directory name
      if (children.length > 0) {
        // Try to find an index/page file to get the section title
        let title = toTitleCase(entry.name)
        
        // Check for page.mdx or page.md
        const pageMdxPath = path.join(fullPath, 'page.mdx')
        const pageMdPath = path.join(fullPath, 'page.md')
        
        try {
          if (fs.existsSync(pageMdxPath)) {
            const { data } = matter(fs.readFileSync(pageMdxPath, 'utf-8'))
            if (data.title) title = data.title
          } else if (fs.existsSync(pageMdPath)) {
            const { data } = matter(fs.readFileSync(pageMdPath, 'utf-8'))
            if (data.title) title = data.title
          }
        } catch {
          // ignore error reading frontmatter
        }

        nodes.push({
          title,
          href: childUrlPrefix, // Clicking the header usually goes to the index of that folder
          items: children,
        })
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))
    ) {
      if (entry.name === 'page.mdx' || entry.name === 'page.md') {
        // This is the index file for the current folder
        // We usually don't list "Index" as a child, but maybe the folder itself links here.
        // For root /docs/page.mdx, we might want to skip adding it as a child of /docs
        if (urlPrefix === '/docs') {
          // Root page, maybe handled separately or added as "Overview"
          // Let's add it as "Overview"
          const content = fs.readFileSync(fullPath, 'utf-8')
          const { data } = matter(content)
          nodes.push({
            title: data.title || 'Overview',
            href: urlPrefix,
            order: data.order || 0,
          })
        }
      } else {
        // Regular doc file
        // intro.mdx -> /docs/intro
        const slug = entry.name.replace(/\.mdx?$/, '')
        const href = `${urlPrefix}/${slug}`

        const content = fs.readFileSync(fullPath, 'utf-8')
        const { data } = matter(content)

        nodes.push({
          title: data.title || toTitleCase(slug),
          href,
          order: data.order || 100,
        })
      }
    }
  }

  return nodes
}

function sortDocs(nodes: DocNode[]): DocNode[] {
  return nodes
    .sort((a, b) => {
      const orderA = a.order ?? 100
      const orderB = b.order ?? 100
      if (orderA !== orderB) return orderA - orderB
      return a.title.localeCompare(b.title)
    })
    .map(node => {
      if (node.items) {
        node.items = sortDocs(node.items)
      }
      return node
    })
}

function toTitleCase(str: string) {
  return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
