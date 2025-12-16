/**
 * File-Based Fallback for Update State Management
 *
 * When Valkey is unavailable, critical update state falls back to file-based storage.
 * This ensures updates can continue even during Valkey outages.
 */

import fs from 'fs/promises'
import path from 'path'
import { log } from '@/lib/logger'
import type { PendingUpdate, RollbackData } from './update-store'

const FALLBACK_DIR = path.join(process.cwd(), 'data', 'update-state')
const FALLBACK_FILES = {
  currentUpdate: 'current-update.json',
  rollbackData: 'rollback-data.json',
  lastSync: 'last-sync.json',
}

interface FallbackState {
  currentUpdate: PendingUpdate | null
  rollbackData: RollbackData | null
  lastModified: string
}

/**
 * Ensure fallback directory exists
 */
async function ensureFallbackDir(): Promise<void> {
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true })
  } catch (err) {
    log.error('UpdateStoreFallback: Failed to create directory', {
      dir: FALLBACK_DIR,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

/**
 * Read fallback file
 */
async function readFallbackFile<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(FALLBACK_DIR, filename)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as T
  } catch (err) {
    // File doesn't exist is expected for fresh installs
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      log.error('UpdateStoreFallback: Failed to read file', {
        file: filename,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
    return null
  }
}

/**
 * Write fallback file
 */
async function writeFallbackFile<T>(filename: string, data: T): Promise<void> {
  try {
    await ensureFallbackDir()
    const filePath = path.join(FALLBACK_DIR, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    log.error('UpdateStoreFallback: Failed to write file', {
      file: filename,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
    throw err
  }
}

/**
 * Delete fallback file
 */
async function deleteFallbackFile(filename: string): Promise<void> {
  try {
    const filePath = path.join(FALLBACK_DIR, filename)
    await fs.unlink(filePath)
  } catch (err) {
    // File doesn't exist is not an error
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      log.error('UpdateStoreFallback: Failed to delete file', {
        file: filename,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }
}

/**
 * Fallback store class for file-based storage
 */
export class UpdateStoreFallback {
  private initialized = false

  /**
   * Initialize fallback storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    await ensureFallbackDir()
    this.initialized = true
    log.info('UpdateStoreFallback: Initialized file-based storage')
  }

  /**
   * Get current pending/approved update from fallback
   */
  async getCurrentUpdate(): Promise<PendingUpdate | null> {
    await this.initialize()
    return readFallbackFile<PendingUpdate>(FALLBACK_FILES.currentUpdate)
  }

  /**
   * Save current update to fallback
   */
  async saveCurrentUpdate(update: PendingUpdate): Promise<void> {
    await this.initialize()
    await writeFallbackFile(FALLBACK_FILES.currentUpdate, update)
    log.info('UpdateStoreFallback: Saved current update', {
      id: update.id,
      version: update.newVersion,
    })
  }

  /**
   * Clear current update from fallback
   */
  async clearCurrentUpdate(): Promise<void> {
    await this.initialize()
    await deleteFallbackFile(FALLBACK_FILES.currentUpdate)
    log.info('UpdateStoreFallback: Cleared current update')
  }

  /**
   * Get rollback data from fallback
   */
  async getRollbackData(): Promise<RollbackData | null> {
    await this.initialize()
    return readFallbackFile<RollbackData>(FALLBACK_FILES.rollbackData)
  }

  /**
   * Save rollback data to fallback
   */
  async saveRollbackData(data: RollbackData): Promise<void> {
    await this.initialize()
    await writeFallbackFile(FALLBACK_FILES.rollbackData, data)
    log.info('UpdateStoreFallback: Saved rollback data')
  }

  /**
   * Clear rollback data from fallback
   */
  async clearRollbackData(): Promise<void> {
    await this.initialize()
    await deleteFallbackFile(FALLBACK_FILES.rollbackData)
    log.info('UpdateStoreFallback: Cleared rollback data')
  }

  /**
   * Get all fallback state
   */
  async getState(): Promise<FallbackState> {
    await this.initialize()
    const [currentUpdate, rollbackData] = await Promise.all([
      this.getCurrentUpdate(),
      this.getRollbackData(),
    ])
    return {
      currentUpdate,
      rollbackData,
      lastModified: new Date().toISOString(),
    }
  }

  /**
   * Check if fallback has any state
   */
  async hasState(): Promise<boolean> {
    const state = await this.getState()
    return state.currentUpdate !== null || state.rollbackData !== null
  }

  /**
   * Clear all fallback state
   */
  async clearAll(): Promise<void> {
    await Promise.all([this.clearCurrentUpdate(), this.clearRollbackData()])
    log.info('UpdateStoreFallback: Cleared all state')
  }
}

// Export singleton instance
export const updateStoreFallback = new UpdateStoreFallback()
