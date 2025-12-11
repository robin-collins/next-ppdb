/**
 * Single Update Endpoint
 *
 * Get or cancel a specific update.
 */

import { NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { updateStore } from '@/lib/update-store'

interface Params {
  params: Promise<{ id: string }>
}

/**
 * GET - Get single update details
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const current = await updateStore.getCurrentUpdate()

    if (!current || current.id !== id) {
      // Check history
      const history = await updateStore.getHistory(50)
      const found = history.find(h => h.id === id)

      if (found) {
        return NextResponse.json({ update: found, source: 'history' })
      }

      return NextResponse.json({ error: 'Update not found' }, { status: 404 })
    }

    return NextResponse.json({ update: current, source: 'current' })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to get update'
    log.error('UpdateById: Failed to get', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}

/**
 * DELETE - Cancel an update (remove from queue)
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const current = await updateStore.getCurrentUpdate()

    if (!current) {
      return NextResponse.json(
        { error: 'No pending update to cancel' },
        { status: 404 }
      )
    }

    if (current.id !== id) {
      return NextResponse.json(
        { error: 'Update ID does not match current pending update' },
        { status: 400 }
      )
    }

    // Only allow cancelling PENDING or APPROVED updates
    if (current.status !== 'PENDING' && current.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `Cannot cancel update with status: ${current.status}` },
        { status: 400 }
      )
    }

    const success = await updateStore.cancelUpdate()

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel update' },
        { status: 500 }
      )
    }

    log.info('UpdateById: Update cancelled', {
      id,
      version: current.newVersion,
    })

    return NextResponse.json({
      success: true,
      message: 'Update cancelled',
      cancelledUpdate: {
        id: current.id,
        version: current.newVersion,
      },
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to cancel update'
    log.error('UpdateById: Failed to cancel', { error })

    return NextResponse.json({ error }, { status: 500 })
  }
}
