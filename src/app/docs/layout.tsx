import { getDocsTree } from '@/lib/docs'
import { DocsShell } from '@/components/docs/DocsShell'

export const dynamic = 'force-static'

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = await getDocsTree()

  return <DocsShell navItems={navItems}>{children}</DocsShell>
}
