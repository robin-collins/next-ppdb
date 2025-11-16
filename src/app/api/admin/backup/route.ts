// src/app/api/admin/backup/route.ts - Backup stub (MVP)
import { NextResponse } from 'next/server'

export async function GET() {
  const timestamp = new Date().toISOString()
  return NextResponse.json({
    status: 'ok',
    message: 'Backup stub executed. Replace with streaming archive in Phase 2.',
    generatedAt: timestamp,
  })
}
