import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
  current?: boolean
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((c, i) => {
        const last = i === items.length - 1
        return (
          <span key={i} className="flex items-center">
            {c.href && !last ? (
              <Link className="breadcrumb-link" href={c.href}>
                {c.label}
              </Link>
            ) : (
              <span className={last ? 'breadcrumb-current' : ''}>
                {c.label}
              </span>
            )}
            {!last ? (
              <span className="breadcrumb-separator mx-2">/</span>
            ) : null}
          </span>
        )
      })}
    </nav>
  )
}
