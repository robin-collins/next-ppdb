'use client'

import { HealthCheckResult, CheckResult } from '@/lib/diagnostics/types'

interface DiagnosticResultsProps {
  health: HealthCheckResult | null
  loading: boolean
}

function CheckCard({ name, result }: { name: string; result: CheckResult }) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        result.passed
          ? 'border-green-200 bg-green-50'
          : 'border-amber-200 bg-amber-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
            result.passed ? 'bg-green-500' : 'bg-amber-500'
          }`}
        >
          {result.passed ? (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 9v2m0 4h.01"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h4
            className={`font-medium ${result.passed ? 'text-green-800' : 'text-amber-800'}`}
          >
            {name}
          </h4>
          <p
            className={`mt-1 text-sm ${result.passed ? 'text-green-700' : 'text-amber-700'}`}
          >
            {result.message}
          </p>
          {result.details && !result.passed && (
            <div className="mt-2 rounded bg-white/50 p-2 text-xs text-amber-600">
              {typeof result.details === 'object' &&
                'hint' in result.details && (
                  <p>{String(result.details.hint)}</p>
                )}
              {typeof result.details === 'object' &&
                'hints' in result.details &&
                Array.isArray(result.details.hints) && (
                  <ul className="list-inside list-disc">
                    {result.details.hints.map((hint, i) => (
                      <li key={i}>{String(hint)}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DiagnosticResults({
  health,
  loading,
}: DiagnosticResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Running Diagnostics...
        </h2>
        <div className="flex items-center gap-3">
          <div className="border-t-primary h-6 w-6 animate-spin rounded-full border-2 border-gray-300" />
          <span className="text-gray-600">Checking system status</span>
        </div>
      </div>
    )
  }

  if (!health) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Failed to load diagnostic results</p>
      </div>
    )
  }

  const checks = [
    { name: 'Database Configuration', result: health.checks.envConfig },
    { name: 'Database Connection', result: health.checks.dbConnection },
    { name: 'Required Tables', result: health.checks.tablesExist },
    { name: 'Schema Validation', result: health.checks.schemaValid },
    { name: 'Data Present', result: health.checks.dataPresent },
  ]

  const passedCount = checks.filter(c => c.result.passed).length
  const allPassed = passedCount === checks.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          System Diagnostics
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            allPassed
              ? 'bg-green-100 text-green-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {passedCount}/{checks.length} passed
        </span>
      </div>

      <div className="space-y-3">
        {checks.map(({ name, result }) => (
          <CheckCard key={name} name={name} result={result} />
        ))}
      </div>

      {!allPassed && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-800">Next Steps</p>
          <p className="mt-1 text-sm text-blue-700">
            Upload a database backup file to initialize your application with
            existing data.
          </p>
        </div>
      )}
    </div>
  )
}
