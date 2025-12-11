// src/app/api/health/route.ts
// Health check endpoint for application startup diagnostics

import { NextResponse } from 'next/server'
import { runDiagnostics, clearDiagnosticCache } from '@/lib/diagnostics'
import { updateStore } from '@/lib/update-store'
import { notificationStore } from '@/lib/notification-store'

interface SchedulerStatus {
  available: boolean
  lastVersionCheck: string | null
  pendingUpdate: {
    exists: boolean
    version?: string
    status?: string
  }
  notifications: {
    unread: number
    highestPriority: string | null
  }
}

/**
 * Get scheduler status from Valkey stores
 */
async function getSchedulerStatus(): Promise<SchedulerStatus> {
  try {
    // Check if Valkey stores are available
    const updateStoreAvailable = updateStore.isAvailable()
    const notificationStoreAvailable = notificationStore.isAvailable()
    const available = updateStoreAvailable || notificationStoreAvailable

    // Get last version check time
    const lastVersionCheck = await updateStore.getLastCheckTime()

    // Get pending update info
    const currentUpdate = await updateStore.getCurrentUpdate()
    const pendingUpdate = {
      exists: !!currentUpdate,
      version: currentUpdate?.newVersion,
      status: currentUpdate?.status,
    }

    // Get notification summary
    const notificationSummary = await notificationStore.getSummary()

    return {
      available,
      lastVersionCheck,
      pendingUpdate,
      notifications: {
        unread: notificationSummary.unread,
        highestPriority: notificationSummary.highestPriority,
      },
    }
  } catch {
    return {
      available: false,
      lastVersionCheck: null,
      pendingUpdate: { exists: false },
      notifications: { unread: 0, highestPriority: null },
    }
  }
}

/**
 * GET /api/health
 * Returns the current health status of the application
 */
export async function GET() {
  try {
    const [result, schedulerStatus] = await Promise.all([
      runDiagnostics(),
      getSchedulerStatus(),
    ])

    // Set appropriate HTTP status based on health
    const httpStatus =
      result.status === 'healthy'
        ? 200
        : result.status === 'needs_setup'
          ? 503
          : 500

    return NextResponse.json(
      {
        ...result,
        scheduler: schedulerStatus,
      },
      { status: httpStatus }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        checks: {
          envConfig: { passed: false, message: 'Check failed' },
          dbConnection: { passed: false, message: 'Check failed' },
          tablesExist: { passed: false, message: 'Check failed' },
          schemaValid: { passed: false, message: 'Check failed' },
          dataPresent: { passed: false, message: 'Check failed' },
        },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/health
 * Clear the diagnostic cache and re-run checks
 * Useful after setup completes to force fresh check
 */
export async function POST() {
  try {
    clearDiagnosticCache()
    const result = await runDiagnostics()

    return NextResponse.json({
      message: 'Cache cleared and diagnostics re-run',
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to refresh',
      },
      { status: 500 }
    )
  }
}
