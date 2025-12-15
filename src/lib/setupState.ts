/**
 * Setup State - File-based persistence
 *
 * Maintains a persistent flag indicating whether setup is required.
 * Uses a file on disk because Next.js isolates module state between
 * instrumentation context and server component context.
 *
 * The flag file is stored at /tmp/ppdb-setup-state.json
 *
 * State transitions:
 * - File doesn't exist or unreadable -> assumes needs setup (true)
 * - File contains { needsSetup: true } -> needs setup
 * - File contains { needsSetup: false } -> healthy, no setup needed
 */

import * as fs from 'fs'
import * as path from 'path'

// Use /tmp for the flag file (persists across module contexts, cleared on container restart)
const FLAG_FILE = path.join('/tmp', 'ppdb-setup-state.json')

interface SetupState {
  needsSetup: boolean
  timestamp: string
}

/**
 * Check if setup is required
 * Returns true if setup is needed, false if healthy
 * Defaults to true if file doesn't exist or is unreadable
 */
export function getNeedsSetup(): boolean {
  try {
    if (!fs.existsSync(FLAG_FILE)) {
      console.log('[SetupState] No flag file found, assuming setup needed')
      return true
    }

    const content = fs.readFileSync(FLAG_FILE, 'utf-8')
    const state: SetupState = JSON.parse(content)
    console.log(
      `[SetupState] Read flag from file: needsSetup=${state.needsSetup}`
    )
    return state.needsSetup
  } catch (error) {
    console.log(
      `[SetupState] Error reading flag file, assuming setup needed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
    return true
  }
}

/**
 * Set the setup requirement flag
 * Called once at startup and again after successful import
 */
export function setNeedsSetup(value: boolean): void {
  const state: SetupState = {
    needsSetup: value,
    timestamp: new Date().toISOString(),
  }

  try {
    fs.writeFileSync(FLAG_FILE, JSON.stringify(state, null, 2))
    console.log(
      `[SetupState] Flag written to file: needsSetup=${value} at ${state.timestamp}`
    )
  } catch (error) {
    console.error(
      `[SetupState] Error writing flag file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

/**
 * Check if setup state file exists
 */
export function isSetupStateInitialized(): boolean {
  return fs.existsSync(FLAG_FILE)
}

/**
 * Clear the setup state file (for testing/reset)
 */
export function clearSetupState(): void {
  try {
    if (fs.existsSync(FLAG_FILE)) {
      fs.unlinkSync(FLAG_FILE)
      console.log('[SetupState] Flag file deleted')
    }
  } catch (error) {
    console.error(
      `[SetupState] Error deleting flag file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}
