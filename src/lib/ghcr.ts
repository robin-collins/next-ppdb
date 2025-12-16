/**
 * GitHub Container Registry (GHCR) Client
 *
 * Provides functionality to query available container image tags
 * and determine the next sequential version for updates.
 */

import semver from 'semver'
import { log } from '@/lib/logger'

// Configuration from environment
const ghcrConfig = {
  get pat(): string | undefined {
    // Support both GHCR_TOKEN (docker-compose) and GHCR_PAT (legacy) for compatibility
    return process.env.GHCR_TOKEN || process.env.GHCR_PAT
  },
  get image(): string {
    return process.env.GHCR_IMAGE || 'ghcr.io/robin-collins/next-ppdb'
  },
  get apiUrl(): string {
    // Allow override for testing
    return process.env.GHCR_API_URL || 'https://ghcr.io'
  },
  get isConfigured(): boolean {
    return !!this.pat
  },
  get testMode(): boolean {
    return process.env.SCHEDULER_TEST_MODE === 'true'
  },
  get mockVersions(): string[] | null {
    const mock = process.env.MOCK_VERSIONS
    return mock ? mock.split(',').map(v => v.trim()) : null
  },
}

export { ghcrConfig }

interface GitHubPackageVersion {
  id: number
  name: string
  metadata?: {
    container?: {
      tags: string[]
    }
  }
}

/**
 * Parse owner and package name from image URL
 */
function parseImagePath(): { owner: string; packageName: string } {
  // ghcr.io/robin-collins/next-ppdb -> owner: robin-collins, package: next-ppdb
  const image = ghcrConfig.image
  const parts = image.replace('ghcr.io/', '').split('/')
  return {
    owner: parts[0],
    packageName: parts.slice(1).join('/'),
  }
}

/**
 * Fetch available tags from GitHub Packages API
 * Uses the REST API which accepts PATs directly (unlike Docker Registry v2 API)
 */
export async function fetchAvailableTags(): Promise<string[]> {
  // Return mock versions in test mode
  if (ghcrConfig.testMode && ghcrConfig.mockVersions) {
    log.info('GHCR: Using mock versions for testing', {
      versions: ghcrConfig.mockVersions,
    })
    return ghcrConfig.mockVersions
  }

  if (!ghcrConfig.isConfigured) {
    log.warn('GHCR: PAT not configured')
    return []
  }

  const { owner, packageName } = parseImagePath()
  // Use GitHub REST API for packages (accepts PAT directly)
  const url = `https://api.github.com/users/${owner}/packages/container/${packageName}/versions?per_page=100`

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${ghcrConfig.pat}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        log.error(
          'GHCR: Authentication failed - PAT may have expired or missing read:packages scope'
        )
        throw new Error(
          'GitHub authentication failed - check PAT has read:packages scope'
        )
      }
      if (response.status === 404) {
        log.warn('GHCR: Package not found', { owner, packageName })
        return []
      }
      const errorBody = await response.text()
      log.error('GHCR: API error', { status: response.status, body: errorBody })
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const versions: GitHubPackageVersion[] = await response.json()

    // Extract all tags from all versions
    const allTags: string[] = []
    for (const version of versions) {
      const tags = version.metadata?.container?.tags || []
      allTags.push(...tags)
    }

    // Filter to only semver-valid tags (deduplicated)
    const uniqueTags = [...new Set(allTags)]
    const validTags = uniqueTags.filter(tag => {
      const cleaned = tag.replace(/^v/, '')
      return semver.valid(cleaned) && !semver.prerelease(cleaned)
    })

    log.info('GHCR: Fetched available tags via GitHub API', {
      totalVersions: versions.length,
      totalTags: allTags.length,
      validTags: validTags.length,
    })

    return validTags
  } catch (err) {
    log.error('GHCR: Failed to fetch tags', {
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    throw err
  }
}

/**
 * Clean version string (remove 'v' prefix)
 */
function cleanVersion(version: string): string {
  return version.replace(/^v/, '')
}

/**
 * Get the next sequential version
 *
 * CRITICAL: Enforces sequential updates - no version skipping allowed.
 *
 * @param currentVersion - Current app version (e.g., "0.1.2")
 * @param availableTags - List of available tags from GHCR
 * @returns The next version in sequence, or null if not available
 */
export function getNextSequentialVersion(
  currentVersion: string,
  availableTags: string[]
): string | null {
  const current = cleanVersion(currentVersion)

  if (!semver.valid(current)) {
    log.error('GHCR: Invalid current version', { currentVersion })
    return null
  }

  // Clean and validate all available tags
  const validVersions = availableTags
    .map(tag => cleanVersion(tag))
    .filter(v => semver.valid(v) && semver.gt(v, current))
    .sort(semver.compare)

  if (validVersions.length === 0) {
    log.info('GHCR: No newer versions available', { currentVersion })
    return null
  }

  // Find the immediate next version (smallest version greater than current)
  const nextVersion = validVersions[0]

  // Verify this is truly the next sequential version
  // For patch releases: 0.1.2 -> 0.1.3 (diff should be small)
  // For minor releases: 0.1.x -> 0.2.0 (minor bump with patch reset)
  // For major releases: 0.x.x -> 1.0.0 (major bump with reset)

  const currentParsed = semver.parse(current)
  const nextParsed = semver.parse(nextVersion)

  if (!currentParsed || !nextParsed) {
    log.error('GHCR: Failed to parse versions')
    return null
  }

  // Check if this is a valid sequential jump
  const isValidSequential =
    // Patch bump: 0.1.2 -> 0.1.3
    (nextParsed.major === currentParsed.major &&
      nextParsed.minor === currentParsed.minor &&
      nextParsed.patch === currentParsed.patch + 1) ||
    // Minor bump: 0.1.x -> 0.2.0
    (nextParsed.major === currentParsed.major &&
      nextParsed.minor === currentParsed.minor + 1 &&
      nextParsed.patch === 0) ||
    // Major bump: 0.x.x -> 1.0.0
    (nextParsed.major === currentParsed.major + 1 &&
      nextParsed.minor === 0 &&
      nextParsed.patch === 0)

  if (!isValidSequential) {
    // There might be missing versions, but we only care about what's available
    log.warn('GHCR: Non-sequential version jump detected', {
      current,
      next: nextVersion,
      skipped: validVersions.slice(0, Math.min(5, validVersions.length)),
    })
  }

  log.info('GHCR: Found next sequential version', {
    current,
    next: nextVersion,
    allNewer: validVersions.slice(0, 5),
  })

  return nextVersion
}

/**
 * Check for available update
 *
 * @param currentVersion - Current app version
 * @returns Update info or null if no update available
 */
export interface UpdateCheckResult {
  hasUpdate: boolean
  nextVersion: string | null
  skippedVersions: string[]
  error?: string
}

export async function checkForUpdate(
  currentVersion: string
): Promise<UpdateCheckResult> {
  try {
    const availableTags = await fetchAvailableTags()
    const nextVersion = getNextSequentialVersion(currentVersion, availableTags)

    if (!nextVersion) {
      return {
        hasUpdate: false,
        nextVersion: null,
        skippedVersions: [],
      }
    }

    // Find all versions newer than nextVersion (versions being "skipped")
    const _current = cleanVersion(currentVersion)
    const skippedVersions = availableTags
      .map(tag => cleanVersion(tag))
      .filter(v => semver.valid(v) && semver.gt(v, nextVersion))
      .sort(semver.compare)

    return {
      hasUpdate: true,
      nextVersion,
      skippedVersions,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    log.error('GHCR: Failed to check for update', { error: errorMessage })
    return {
      hasUpdate: false,
      nextVersion: null,
      skippedVersions: [],
      error: errorMessage,
    }
  }
}

/**
 * Pull a specific image version
 * Note: This just constructs the command - actual execution is in scheduler container
 */
export function getPullCommand(version: string): string {
  const image = ghcrConfig.image
  const cleanVer = cleanVersion(version)
  return `docker pull ${image}:${cleanVer}`
}

/**
 * Verify a version exists in the registry
 */
export async function verifyVersionExists(version: string): Promise<boolean> {
  try {
    const tags = await fetchAvailableTags()
    const cleanVer = cleanVersion(version)
    return tags.some(tag => cleanVersion(tag) === cleanVer)
  } catch {
    return false
  }
}
