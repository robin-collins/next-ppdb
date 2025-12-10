For a single directory of `.mdx` files with build-time indexing in Next.js 15, the best combination is **Fuse.js** (search engine) + a **custom build script** (indexing).

This approach keeps your runtime bundle small (the index is just a static JSON file) and gives you full control over what gets indexed.

### 1. The Strategy

1.  **Build Time:** Run a script that reads your `.mdx` files, strips the Markdown syntax to plain text, and saves a `search-index.json` file to your `public` folder.
2.  **Runtime:** Your search component fetches this JSON file and uses **Fuse.js** to perform the fuzzy search on the client side.

### 2. Implementation Steps

#### Step A: Install Dependencies

You need `fuse.js` for the search and `gray-matter` (to parse MDX frontmatter) + `remark-strip-html` (or similar) to clean the text for the script.

```bash
npm install fuse.js
npm install -D gray-matter remark remark-strip-html
```

#### Step B: Create the Indexing Script

Create a file at `scripts/build-search.mjs`. This script will generate the index.

```javascript
// scripts/build-search.mjs
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import strip from 'strip-markdown'

const CONTENT_DIR = path.join(process.cwd(), 'content/posts') // Change to your directory
const OUTPUT_FILE = path.join(process.cwd(), 'public/search-index.json')

async function generateIndex() {
  const files = fs.readdirSync(CONTENT_DIR)
  const index = []

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    const fullPath = path.join(CONTENT_DIR, file)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Strip Markdown to get plain text for better search indexing
    const processedContent = await remark().use(strip).process(content)
    const plainText = processedContent.toString()

    index.push({
      slug: file.replace('.mdx', ''),
      title: data.title || file.replace('.mdx', ''),
      description: data.description || '',
      content: plainText, // Full text content
    })
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index))
  console.log(`Search index generated with ${index.length} documents.`)
}

generateIndex()
```

#### Step C: Update `package.json`

Update your build command to ensure the index is generated _before_ Next.js builds the app.

```json
"scripts": {
  "build": "node scripts/build-search.mjs && next build",
  "dev": "node scripts/build-search.mjs && next dev"
}
```

#### Step D: Create the Search Component

Now, create a Client Component that loads the index and runs the search.

```tsx
// app/components/search.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [index, setIndex] = useState<any[]>([])

  // Load the index once on mount
  useEffect(() => {
    fetch('/search-index.json')
      .then(res => res.json())
      .then(data => setIndex(data))
  }, [])

  // Configure Fuse.js
  const fuse = useMemo(() => {
    return new Fuse(index, {
      keys: ['title', 'description', 'content'], // Search in these fields
      threshold: 0.3, // 0.0 = perfect match, 1.0 = match anything
      includeScore: true,
      ignoreLocation: true, // Search full text regardless of where the term is
    })
  }, [index])

  // Run search when query changes
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    const searchResults = fuse.search(query)
    setResults(searchResults.map(result => result.item))
  }, [query, fuse])

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search documentation..."
        className="w-full rounded-md border p-2 text-black"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white text-black shadow-lg">
          {results.map(post => (
            <li key={post.slug} className="border-b last:border-0">
              <Link
                href={`/blog/${post.slug}`}
                className="block p-3 hover:bg-gray-100"
                onClick={() => setQuery('')} // Close on click
              >
                <div className="font-bold">{post.title}</div>
                <div className="truncate text-xs text-gray-500">
                  {post.description}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Why this is the "Best" way for Next.js 15?

1.  **Performance:** The heavy lifting (text processing) happens at build time, not in the user's browser.
2.  **Zero Server Load:** The search happens entirely in the client's browser using the static JSON file.
3.  **Flexibility:** You can easily switch `fuse.js` for `orama` (which is slightly faster for larger datasets) without changing the build script logic.
