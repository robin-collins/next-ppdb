/**
 * Pending Updates Endpoint
 *
 * List pending updates awaiting approval and update history.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { updateStore } from '@/lib/update-store'

/**
 * GET - Get pending update and history
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const includeHistory = url.searchParams.get('history') === 'true'
    const historyLimit = parseInt(url.searchParams.get('limit') || '20', 10)

    const pending = await updateStore.getCurrentUpdate()
    const lastCheck = await updateStore.getLastCheckTime()

    const response: {
      pending: typeof pending
      lastCheck: string | null
      history?: Awaited<ReturnType<typeof updateStore.getHistory>>
      environment?: Record<string, string>
    } = {
      pending,
      lastCheck,
    }

    if (includeHistory) {
      response.history = await updateStore.getHistory(historyLimit)
    }

    // Add environment info
    const pkg = require('../../../../../../package.json')
    response.environment = {
      app: pkg.version,
      next: pkg.dependencies.next,
      react: pkg.dependencies.react,
      prisma: pkg.dependencies['@prisma/client'],
      typescript: pkg.devDependencies.typescript,
      tailwindcss: pkg.devDependencies.tailwindcss,
      node: process.version,
    }

    return NextResponse.json(response)
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Failed to get pending updates'
    log.error('PendingUpdates: Failed to get', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
