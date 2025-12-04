/**
 * Request Deduplication Cache
 *
 * Prevents duplicate concurrent requests and provides short-term caching.
 * Uses a Map to track in-flight requests and cache responses.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

// Default cache TTL: 5 seconds (short enough to stay fresh, long enough to dedupe)
const DEFAULT_CACHE_TTL = 5000
// Maximum age for pending requests before considering them stale
const PENDING_REQUEST_TIMEOUT = 30000

class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private pending = new Map<string, PendingRequest<unknown>>()
  private cacheTTL: number

  constructor(ttl: number = DEFAULT_CACHE_TTL) {
    this.cacheTTL = ttl
  }

  /**
   * Get a cached value if it exists and is not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Invalidate a cache entry or entries matching a prefix
   */
  invalidate(keyOrPrefix: string): void {
    // Exact match
    if (this.cache.has(keyOrPrefix)) {
      this.cache.delete(keyOrPrefix)
      return
    }

    // Prefix match - invalidate all keys starting with the prefix
    for (const key of this.cache.keys()) {
      if (key.startsWith(keyOrPrefix)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Execute a request with deduplication
   * If an identical request is in-flight, returns the same promise
   * If cached data exists and is fresh, returns cached data
   */
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Check if request is already in-flight
    const pendingEntry = this.pending.get(key) as PendingRequest<T> | undefined
    if (pendingEntry) {
      // Check if pending request is too old (might be stuck)
      const age = Date.now() - pendingEntry.timestamp
      if (age < PENDING_REQUEST_TIMEOUT) {
        return pendingEntry.promise
      }
      // Remove stale pending request
      this.pending.delete(key)
    }

    // Create new request
    const promise = fetcher()
      .then(data => {
        this.set(key, data)
        this.pending.delete(key)
        return data
      })
      .catch(error => {
        this.pending.delete(key)
        throw error
      })

    this.pending.set(key, {
      promise,
      timestamp: Date.now(),
    })

    return promise
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(): { cacheSize: number; pendingSize: number } {
    return {
      cacheSize: this.cache.size,
      pendingSize: this.pending.size,
    }
  }
}

// Export singleton instances for different cache domains
export const animalCache = new RequestCache()
export const customerCache = new RequestCache()
export const breedCache = new RequestCache()

// Export the class for custom instances
export { RequestCache }

// Cache key generators
export const cacheKeys = {
  animalSearch: (params: Record<string, string | number>) =>
    `animal:search:${JSON.stringify(params)}`,
  animalDetail: (id: number) => `animal:${id}`,
  customerSearch: (params: Record<string, string | number>) =>
    `customer:search:${JSON.stringify(params)}`,
  customerDetail: (id: number) => `customer:${id}`,
  breedList: () => `breed:list`,
  breedDetail: (id: number) => `breed:${id}`,
}
