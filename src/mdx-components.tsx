import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings with proper spacing
    h1: ({ children }) => (
      <h1 className="mb-8 mt-4 border-b-2 border-indigo-200 pb-4 text-3xl font-bold text-gray-900">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-6 mt-10 border-b border-gray-200 pb-3 text-2xl font-semibold text-gray-800">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-4 mt-8 text-xl font-semibold text-gray-700">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-3 mt-6 text-lg font-medium text-gray-700">{children}</h4>
    ),

    // Paragraphs with good spacing - using div to allow block children
    p: ({ children }) => {
      // Check if children contains an image (which would cause nesting issues)
      const hasBlockContent =
        children &&
        typeof children === 'object' &&
        'type' in children &&
        (children.type === 'img' || children.type === Image)

      if (hasBlockContent) {
        // Return children directly without wrapping in p
        return <>{children}</>
      }

      return (
        <p className="mb-5 leading-7 text-gray-700">{children}</p>
      )
    },

    // Lists - proper indentation and bullet placement
    ul: ({ children }) => (
      <ul className="mb-6 ml-4 list-inside list-disc space-y-2 text-gray-700">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-6 ml-4 list-inside list-decimal space-y-2 text-gray-700">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-7 pl-2">{children}</li>
    ),

    // Tables - properly styled with good contrast
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-indigo-50">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="transition-colors hover:bg-gray-50">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-5 py-4 text-left text-sm font-semibold text-gray-800">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-5 py-4 text-sm text-gray-700">{children}</td>
    ),

    // Code blocks
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-xl bg-gray-900 p-5 text-sm leading-relaxed text-gray-100">
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="rounded-md bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-700">
        {children}
      </code>
    ),

    // Images - simplified to avoid nesting issues, no figure wrapper
    img: ({ src, alt }) => (
      <span className="my-8 block">
        <span className="block overflow-hidden rounded-xl border border-gray-200 shadow-lg">
          <Image
            src={src || ''}
            alt={alt || ''}
            width={800}
            height={500}
            className="h-auto w-full"
            style={{ maxHeight: '600px', objectFit: 'contain', backgroundColor: '#f9fafb' }}
          />
        </span>
        {alt && (
          <span className="mt-3 block text-center text-sm font-medium text-gray-500">
            {alt}
          </span>
        )}
      </span>
    ),

    // Links - visible colors with good contrast
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-2 transition-colors hover:text-indigo-800 hover:decoration-indigo-500"
      >
        {children}
      </a>
    ),

    // Strong/Bold - visible color
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),

    // Emphasis
    em: ({ children }) => (
      <em className="italic text-gray-700">{children}</em>
    ),

    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-indigo-400 bg-indigo-50 py-4 pl-6 pr-4 italic text-gray-700">
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: () => <hr className="my-10 border-t-2 border-gray-200" />,

    ...components,
  }
}
