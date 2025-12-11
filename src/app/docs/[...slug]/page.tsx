import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'

// Force dynamic because we are reading files based on URL parameters
// OR generateStaticParams for SSG (Better for docs)
export const dynamicParams = true

async function getDocContent(slug: string[]) {
  const slugPath = slug.join('/')
  const docsDir = path.join(process.cwd(), 'src/app/docs')

  // Try .mdx then .md
  let filePath = path.join(docsDir, `${slugPath}.mdx`)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, `${slugPath}.md`)
  }

  // If still not found, check if it's a directory -> index.mdx (e.g. /docs/auth -> /docs/auth/index.mdx)
  if (!fs.existsSync(filePath)) {
    const dirPath = path.join(docsDir, slugPath)
    if (fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory()) {
      filePath = path.join(dirPath, 'index.mdx')
      if (!fs.existsSync(filePath)) {
        filePath = path.join(dirPath, 'index.md')
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    return null
  }

  const source = fs.readFileSync(filePath, 'utf8')

  return { source, filePath }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const resolvedParams = await params
  const content = await getDocContent(resolvedParams.slug)
  if (!content) return {}

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

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const resolvedParams = await params
  const content = await getDocContent(resolvedParams.slug)

  if (!content) {
    notFound()
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
