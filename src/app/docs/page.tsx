import fs from 'fs'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'

export const dynamic = 'force-static'

async function getDocsIndexContent() {
  const docsDir = path.join(process.cwd(), 'src/app/docs')

  // Try .mdx then .md for the index page content file
  let filePath = path.join(docsDir, 'index.mdx')
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, 'index.md')
  }

  if (!fs.existsSync(filePath)) {
    return null
  }

  const source = fs.readFileSync(filePath, 'utf8')
  return { source, filePath }
}

export async function generateMetadata() {
  const content = await getDocsIndexContent()
  if (!content) return { title: 'Documentation' }

  const { frontmatter } = await compileMDX<{
    title?: string
    description?: string
  }>({
    source: content.source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
      },
    },
  })

  return {
    title: frontmatter.title || 'Documentation',
    description: frontmatter.description || '',
  }
}

export default async function DocsPage() {
  const content = await getDocsIndexContent()

  if (!content) {
    return (
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h1>Documentation</h1>
        <p>Welcome to the documentation.</p>
      </div>
    )
  }

  const { content: mdxContent } = await compileMDX<{ title?: string }>({
    source: content.source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
      },
    },
    components: {
      // Map common HTML elements if needed, or rely on Tailwind Typography
    },
  })

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {mdxContent}
    </div>
  )
}

// Optional: caching/revalidation
export const revalidate = 3600
