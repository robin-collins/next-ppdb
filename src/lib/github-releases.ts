/**
 * GitHub Releases API Client
 *
 * Fetches release notes from GitHub Releases API for staff review before approving updates.
 */

import { log } from '@/lib/logger'

interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
}

export interface ReleaseInfo {
  tagName: string
  title: string
  body: string
  publishedAt: string
  url: string
  prerelease: boolean
  draft: boolean
}

// Configuration
const githubConfig = {
  get owner(): string {
    return process.env.GITHUB_OWNER || 'robin-collins'
  },
  get repo(): string {
    return process.env.GITHUB_REPO || 'next-ppdb'
  },
  get token(): string | undefined {
    return process.env.GITHUB_TOKEN
  },
  get apiUrl(): string {
    return 'https://api.github.com'
  },
}

/**
 * Build headers for GitHub API requests
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'PPDB-Scheduler/1.0',
  }

  // Add auth token if available (increases rate limit from 60 to 5000 req/hour)
  if (githubConfig.token) {
    headers.Authorization = `Bearer ${githubConfig.token}`
  }

  return headers
}

/**
 * Fetch release notes for a specific version
 *
 * @param version - Version string (with or without 'v' prefix)
 * @returns Release info or null if not found
 */
export async function getReleaseNotes(
  version: string
): Promise<ReleaseInfo | null> {
  // Ensure version has 'v' prefix for GitHub tag lookup
  const tagName = version.startsWith('v') ? version : `v${version}`

  const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/releases/tags/${tagName}`

  try {
    const response = await fetch(url, {
      headers: buildHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        log.info('GitHub: No release found for version', { version: tagName })
        return null
      }

      if (response.status === 403) {
        const remaining = response.headers.get('X-RateLimit-Remaining')
        log.warn('GitHub: Rate limit may be exceeded', { remaining })
      }

      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: GitHubRelease = await response.json()

    log.info('GitHub: Fetched release notes', {
      version: tagName,
      title: data.name,
    })

    return {
      tagName: data.tag_name,
      title: data.name || `Release ${data.tag_name}`,
      body: data.body || 'No release notes available.',
      publishedAt: data.published_at,
      url: data.html_url,
      prerelease: data.prerelease,
      draft: data.draft,
    }
  } catch (err) {
    log.error('GitHub: Failed to fetch release notes', {
      version: tagName,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Fetch latest release
 *
 * @returns Latest release info or null if not found
 */
export async function getLatestRelease(): Promise<ReleaseInfo | null> {
  const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/releases/latest`

  try {
    const response = await fetch(url, {
      headers: buildHeaders(),
    })

    if (!response.ok) {
      if (response.status === 404) {
        log.info('GitHub: No releases found')
        return null
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: GitHubRelease = await response.json()

    return {
      tagName: data.tag_name,
      title: data.name || `Release ${data.tag_name}`,
      body: data.body || 'No release notes available.',
      publishedAt: data.published_at,
      url: data.html_url,
      prerelease: data.prerelease,
      draft: data.draft,
    }
  } catch (err) {
    log.error('GitHub: Failed to fetch latest release', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Fetch multiple releases
 *
 * @param limit - Maximum number of releases to fetch
 * @returns Array of release info
 */
export async function getReleases(limit: number = 10): Promise<ReleaseInfo[]> {
  const url = `${githubConfig.apiUrl}/repos/${githubConfig.owner}/${githubConfig.repo}/releases?per_page=${limit}`

  try {
    const response = await fetch(url, {
      headers: buildHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: GitHubRelease[] = await response.json()

    return data.map(release => ({
      tagName: release.tag_name,
      title: release.name || `Release ${release.tag_name}`,
      body: release.body || 'No release notes available.',
      publishedAt: release.published_at,
      url: release.html_url,
      prerelease: release.prerelease,
      draft: release.draft,
    }))
  } catch (err) {
    log.error('GitHub: Failed to fetch releases', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return []
  }
}

/**
 * Check GitHub API rate limit status
 */
export async function checkRateLimit(): Promise<{
  limit: number
  remaining: number
  reset: Date
} | null> {
  const url = `${githubConfig.apiUrl}/rate_limit`

  try {
    const response = await fetch(url, {
      headers: buildHeaders(),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data = await response.json()
    const core = data.resources.core

    return {
      limit: core.limit,
      remaining: core.remaining,
      reset: new Date(core.reset * 1000),
    }
  } catch (err) {
    log.error('GitHub: Failed to check rate limit', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    return null
  }
}
