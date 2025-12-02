// src/lib/import/importLogger.ts
// File-based import logging for audit trail and debugging
// Creates one log file per table with detailed record-level information

import * as fs from 'fs/promises'
import * as path from 'path'

export interface ImportLogRecord {
  timestamp: string
  originalId: number | null
  newId?: number
  status: 'imported' | 'repaired' | 'skipped' | 'failed'
  originalData: Record<string, unknown>
  importedData?: Record<string, unknown>
  repairs?: string[]
  skipReason?: string
  error?: string
}

export interface ImportLogSummary {
  table: string
  startTime: string
  endTime: string
  totalRecords: number
  imported: number
  repaired: number
  skipped: number
  failed: number
}

export class ImportLogger {
  private logDir: string
  private table: string
  private records: ImportLogRecord[] = []
  private startTime: Date
  private fileHandle: fs.FileHandle | null = null

  constructor(logDir: string, table: string) {
    this.logDir = logDir
    this.table = table
    this.startTime = new Date()
  }

  async init(): Promise<void> {
    await fs.mkdir(this.logDir, { recursive: true })
    const filename = `${this.table}_import_${this.startTime.toISOString().replace(/[:.]/g, '-')}.log`
    const filepath = path.join(this.logDir, filename)
    this.fileHandle = await fs.open(filepath, 'w')

    // Write header
    await this.writeLine('='.repeat(80))
    await this.writeLine(`IMPORT LOG: ${this.table.toUpperCase()}`)
    await this.writeLine(`Started: ${this.startTime.toISOString()}`)
    await this.writeLine('='.repeat(80))
    await this.writeLine('')
  }

  private async writeLine(line: string): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.write(line + '\n')
    }
  }

  async logImported(
    originalId: number | null,
    newId: number,
    originalData: Record<string, unknown>,
    importedData: Record<string, unknown>
  ): Promise<void> {
    const record: ImportLogRecord = {
      timestamp: new Date().toISOString(),
      originalId,
      newId,
      status: 'imported',
      originalData,
      importedData,
    }
    this.records.push(record)

    await this.writeLine(`[IMPORTED] ID: ${originalId} → ${newId}`)
  }

  async logRepaired(
    originalId: number | null,
    newId: number,
    originalData: Record<string, unknown>,
    importedData: Record<string, unknown>,
    repairs: string[]
  ): Promise<void> {
    const record: ImportLogRecord = {
      timestamp: new Date().toISOString(),
      originalId,
      newId,
      status: 'repaired',
      originalData,
      importedData,
      repairs,
    }
    this.records.push(record)

    await this.writeLine('')
    await this.writeLine(`[REPAIRED] ID: ${originalId} → ${newId}`)
    await this.writeLine('  Original data:')
    await this.writeLine(`    ${JSON.stringify(originalData)}`)
    await this.writeLine('  Imported as:')
    await this.writeLine(`    ${JSON.stringify(importedData)}`)
    await this.writeLine('  Repairs applied:')
    for (const repair of repairs) {
      await this.writeLine(`    - ${repair}`)
    }
  }

  async logSkipped(
    originalId: number | null,
    originalData: Record<string, unknown>,
    reason: string
  ): Promise<void> {
    const record: ImportLogRecord = {
      timestamp: new Date().toISOString(),
      originalId,
      status: 'skipped',
      originalData,
      skipReason: reason,
    }
    this.records.push(record)

    await this.writeLine('')
    await this.writeLine(`[SKIPPED] ID: ${originalId}`)
    await this.writeLine('  Original data:')
    await this.writeLine(`    ${JSON.stringify(originalData)}`)
    await this.writeLine(`  Reason: ${reason}`)
  }

  async logFailed(
    originalId: number | null,
    originalData: Record<string, unknown>,
    error: string
  ): Promise<void> {
    const record: ImportLogRecord = {
      timestamp: new Date().toISOString(),
      originalId,
      status: 'failed',
      originalData,
      error,
    }
    this.records.push(record)

    await this.writeLine('')
    await this.writeLine(`[FAILED] ID: ${originalId}`)
    await this.writeLine('  Original data:')
    await this.writeLine(`    ${JSON.stringify(originalData)}`)
    await this.writeLine(`  Error: ${error}`)
  }

  async logInfo(message: string): Promise<void> {
    await this.writeLine(`[INFO] ${message}`)
  }

  async logWarning(message: string): Promise<void> {
    await this.writeLine(`[WARNING] ${message}`)
  }

  async logError(message: string): Promise<void> {
    await this.writeLine(`[ERROR] ${message}`)
  }

  async close(): Promise<ImportLogSummary> {
    const endTime = new Date()
    const summary: ImportLogSummary = {
      table: this.table,
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalRecords: this.records.length,
      imported: this.records.filter(r => r.status === 'imported').length,
      repaired: this.records.filter(r => r.status === 'repaired').length,
      skipped: this.records.filter(r => r.status === 'skipped').length,
      failed: this.records.filter(r => r.status === 'failed').length,
    }

    // Write summary
    await this.writeLine('')
    await this.writeLine('='.repeat(80))
    await this.writeLine('SUMMARY')
    await this.writeLine('='.repeat(80))
    await this.writeLine(`Total records processed: ${summary.totalRecords}`)
    await this.writeLine(`  Imported (clean):     ${summary.imported}`)
    await this.writeLine(`  Imported (repaired):  ${summary.repaired}`)
    await this.writeLine(`  Skipped:              ${summary.skipped}`)
    await this.writeLine(`  Failed:               ${summary.failed}`)
    await this.writeLine(
      `Duration: ${(endTime.getTime() - this.startTime.getTime()) / 1000}s`
    )
    await this.writeLine('='.repeat(80))

    if (this.fileHandle) {
      await this.fileHandle.close()
      this.fileHandle = null
    }

    return summary
  }

  getRecords(): ImportLogRecord[] {
    return this.records
  }
}

/**
 * Create log directory for this import session
 */
export function getImportLogDir(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return path.join(process.cwd(), 'logs', 'import', timestamp)
}

/**
 * Stats for summary report
 */
export interface TableImportStats {
  total: number
  imported: number
  repaired: number
  skipped: number
  failed: number
  orphaned: number // Subset of skipped - records with missing parent ID
}

export interface ImportSummary {
  breeds: TableImportStats
  customers: TableImportStats
  animals: TableImportStats
  notes: TableImportStats
  startTime: string
  endTime: string
  duration: string
}

/**
 * Write import summary report to logs folder
 */
export async function writeImportSummary(
  logDir: string,
  summary: ImportSummary
): Promise<string> {
  const filename = 'IMPORT_SUMMARY.txt'
  const filepath = path.join(logDir, filename)

  const lines: string[] = [
    '╔════════════════════════════════════════════════════════════════════════════════╗',
    '║                         DATABASE IMPORT SUMMARY REPORT                         ║',
    '╚════════════════════════════════════════════════════════════════════════════════╝',
    '',
    `Import Started:  ${summary.startTime}`,
    `Import Finished: ${summary.endTime}`,
    `Duration:        ${summary.duration}`,
    '',
    '════════════════════════════════════════════════════════════════════════════════',
    '',
  ]

  // Table summaries
  const tables: { name: string; stats: TableImportStats }[] = [
    { name: 'BREEDS', stats: summary.breeds },
    { name: 'CUSTOMERS', stats: summary.customers },
    { name: 'ANIMALS', stats: summary.animals },
    { name: 'NOTES', stats: summary.notes },
  ]

  let totalImported = 0
  let totalRepaired = 0
  let totalOrphaned = 0
  let totalSkipped = 0

  for (const { name, stats } of tables) {
    const successCount = stats.imported + stats.repaired
    totalImported += successCount
    totalRepaired += stats.repaired
    totalOrphaned += stats.orphaned
    totalSkipped += stats.skipped

    lines.push(`${name}:`)
    lines.push(`  Total in backup:     ${stats.total.toLocaleString()}`)
    lines.push(`  Successfully imported: ${successCount.toLocaleString()}`)
    if (stats.repaired > 0) {
      lines.push(`    - Clean imports:   ${stats.imported.toLocaleString()}`)
      lines.push(`    - Repaired:        ${stats.repaired.toLocaleString()}`)
    }
    if (stats.orphaned > 0) {
      lines.push(`  Orphaned (skipped):  ${stats.orphaned.toLocaleString()}`)
    }
    if (stats.skipped - stats.orphaned > 0) {
      lines.push(
        `  Other skipped:       ${(stats.skipped - stats.orphaned).toLocaleString()}`
      )
    }
    if (stats.failed > 0) {
      lines.push(`  Failed:              ${stats.failed.toLocaleString()}`)
    }
    lines.push('')
  }

  // Grand totals
  lines.push(
    '════════════════════════════════════════════════════════════════════════════════'
  )
  lines.push('')
  lines.push('TOTALS:')
  lines.push(`  Records imported:    ${totalImported.toLocaleString()}`)
  lines.push(`  Records repaired:    ${totalRepaired.toLocaleString()}`)
  lines.push(`  Orphaned records:    ${totalOrphaned.toLocaleString()}`)
  if (totalSkipped - totalOrphaned > 0) {
    lines.push(
      `  Other skipped:       ${(totalSkipped - totalOrphaned).toLocaleString()}`
    )
  }
  lines.push('')

  // Notes about orphaned records
  if (totalOrphaned > 0) {
    lines.push(
      '════════════════════════════════════════════════════════════════════════════════'
    )
    lines.push('')
    lines.push(
      'NOTE: Orphaned records are those with missing parent references:'
    )
    lines.push('  - Animals without a valid customerID (customer was deleted)')
    lines.push('  - Notes without a valid animalID (animal was deleted)')
    lines.push('')
    lines.push('These records were skipped to maintain database integrity.')
    lines.push('Check individual table logs for specific record details.')
    lines.push('')
  }

  lines.push(
    '════════════════════════════════════════════════════════════════════════════════'
  )
  lines.push(`Full import logs available in: ${logDir}`)
  lines.push(
    '════════════════════════════════════════════════════════════════════════════════'
  )

  await fs.writeFile(filepath, lines.join('\n'))
  return filepath
}
