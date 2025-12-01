'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'

interface PricingModifierProps {
  breedId?: number
  breedName?: string
  currentAvgcost?: number | null
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function PricingModifier({
  breedId,
  breedName,
  currentAvgcost,
  onClose,
  onSuccess,
  onError,
}: PricingModifierProps) {
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'percentage'>(
    'fixed'
  )
  const [adjustmentValue, setAdjustmentValue] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmInputRef = useRef<HTMLInputElement>(null)

  const isGlobal = !breedId
  const confirmPhrase = isGlobal
    ? 'update all breed pricing'
    : (breedName ?? '')

  // Define handleClose with useCallback to avoid dependency issues
  const handleClose = useCallback(() => {
    setIsVisible(false)
    // Wait for animation to complete before calling onClose
    setTimeout(onClose, 200)
  }, [onClose])

  // Animate in on mount
  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  // Focus confirm input when modal opens
  useEffect(() => {
    if (showConfirmModal && confirmInputRef.current) {
      confirmInputRef.current.focus()
    }
  }, [showConfirmModal])

  // Show confirmation modal instead of direct submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const value = parseFloat(adjustmentValue)
    if (isNaN(value) || value <= 0) {
      onError('Please enter a valid positive number')
      return
    }

    // Show confirmation modal
    setConfirmText('')
    setShowConfirmModal(true)
  }

  // Execute the actual pricing update after confirmation
  const executeUpdate = async () => {
    const value = parseFloat(adjustmentValue)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/breeds/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breedId,
          adjustmentType,
          adjustmentValue: value,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update pricing')
      }

      onSuccess(data.message)
      handleClose()
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'Failed to update pricing'
      )
      setShowConfirmModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canConfirm = confirmText === confirmPhrase
  const previewAmount = parseFloat(adjustmentValue) || 0
  const currentCost = currentAvgcost ?? 0

  // Calculate preview
  let previewNewCost: number
  if (adjustmentType === 'fixed') {
    previewNewCost = currentCost + previewAmount
  } else {
    previewNewCost = Math.round(currentCost * (1 + previewAmount / 100))
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden transition-all duration-300 ease-out ${
        isVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="mt-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-900">
              <svg
                className="h-5 w-5 text-indigo-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
              {isGlobal
                ? 'Modify All Breeds Base Pricing'
                : `Modify "${breedName}" Pricing`}
            </h3>
            <p className="mt-1 text-sm text-indigo-700">
              {isGlobal
                ? 'This will update ALL breed avgcost values and adjust animal costs accordingly.'
                : `This will update the avgcost for "${breedName}" and adjust all associated animal costs.`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
            aria-label="Close pricing modifier"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Warning */}
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <div className="text-sm text-amber-800">
            <strong>Important:</strong> This operation will:
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>
                Update breed avgcost value{isGlobal ? 's' : ''} by the specified
                amount
              </li>
              <li>
                Increase animal costs that are below or equal to their
                breed&apos;s avgcost
              </li>
              <li>
                Preserve cost differences for animals priced above their
                breed&apos;s avgcost
              </li>
              <li>Leave animals with $0 cost unchanged</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-end gap-4">
            {/* Adjustment Type */}
            <div className="min-w-[200px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-indigo-900">
                Adjustment Type
              </label>
              <div className="flex rounded-lg border border-indigo-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setAdjustmentType('fixed')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    adjustmentType === 'fixed'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  Fixed Amount ($)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentType('percentage')}
                  className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    adjustmentType === 'percentage'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  Percentage (%)
                </button>
              </div>
            </div>

            {/* Adjustment Value */}
            <div className="min-w-[150px] flex-1">
              <label
                htmlFor="adjustment-value"
                className="mb-1.5 block text-sm font-medium text-indigo-900"
              >
                {adjustmentType === 'fixed'
                  ? 'Amount to Add ($)'
                  : 'Percentage Increase (%)'}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-indigo-500">
                  {adjustmentType === 'fixed' ? '$' : ''}
                </span>
                <input
                  ref={inputRef}
                  id="adjustment-value"
                  type="number"
                  min={adjustmentType === 'fixed' ? '1' : '0.1'}
                  step={adjustmentType === 'fixed' ? '1' : '0.1'}
                  value={adjustmentValue}
                  onChange={e => setAdjustmentValue(e.target.value)}
                  placeholder={adjustmentType === 'fixed' ? '10' : '25'}
                  className={`w-full rounded-lg border border-indigo-300 bg-white py-2 pr-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none ${
                    adjustmentType === 'fixed' ? 'pl-7' : 'pl-3'
                  }`}
                  required
                />
                {adjustmentType === 'percentage' && (
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-indigo-500">
                    %
                  </span>
                )}
              </div>
            </div>

            {/* Preview (for individual breed) */}
            {!isGlobal && currentAvgcost !== undefined && previewAmount > 0 && (
              <div className="min-w-[180px] flex-1">
                <label className="mb-1.5 block text-sm font-medium text-indigo-900">
                  Preview
                </label>
                <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm">
                  <span className="text-green-700">
                    ${currentCost} &rarr;{' '}
                    <strong className="text-green-800">
                      ${previewNewCost}
                    </strong>
                  </span>
                  <span className="ml-2 text-green-600">
                    (+
                    {adjustmentType === 'fixed'
                      ? `$${previewAmount}`
                      : `${previewAmount}%`}
                    )
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-indigo-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!adjustmentValue}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-all ${
                !adjustmentValue
                  ? 'cursor-not-allowed bg-indigo-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Apply{' '}
              {adjustmentValue
                ? adjustmentType === 'fixed'
                  ? `+$${adjustmentValue}`
                  : `+${adjustmentValue}%`
                : ''}{' '}
              {isGlobal ? 'to All Breeds' : 'to Breed'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isSubmitting && setShowConfirmModal(false)}
          />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
            style={{
              animation: 'slideInUp 0.2s ease-out',
              border: '2px solid #f59e0b',
            }}
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-full bg-amber-100 p-3">
                <svg
                  className="h-6 w-6 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-700">
                  Confirm Pricing Update
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This action will modify pricing data.
                </p>
              </div>
              <button
                className="ml-auto text-gray-400 hover:text-gray-600"
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Summary of what will happen */}
            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="text-sm text-indigo-900">
                <strong>You are about to apply:</strong>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-indigo-600 px-3 py-1 font-medium text-white">
                    {adjustmentType === 'fixed'
                      ? `+$${adjustmentValue}`
                      : `+${adjustmentValue}%`}
                  </span>
                  <span>
                    to{' '}
                    {isGlobal ? (
                      <strong>ALL breeds</strong>
                    ) : (
                      <>
                        breed <strong>&quot;{breedName}&quot;</strong>
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-3 text-indigo-700">
                  This will update{' '}
                  {isGlobal
                    ? 'all breed avgcost values and associated animal costs'
                    : `the avgcost for "${breedName}" and all associated animal costs`}
                  .
                </p>
              </div>
            </div>

            {/* Type to confirm */}
            <div className="mt-4">
              <label
                htmlFor="confirm-pricing-text"
                className="block text-sm font-medium text-gray-700"
              >
                To confirm, type{' '}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-amber-600">
                  {confirmPhrase}
                </code>{' '}
                below:
              </label>
              <input
                ref={confirmInputRef}
                id="confirm-pricing-text"
                type="text"
                className="mt-2 w-full rounded-md border border-amber-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder={`Type "${confirmPhrase}" to confirm`}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                disabled={isSubmitting}
              />
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                className={`flex-1 rounded-lg px-4 py-2.5 font-medium transition-all ${
                  canConfirm && !isSubmitting
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'cursor-not-allowed bg-gray-200 text-gray-400'
                }`}
                disabled={!canConfirm || isSubmitting}
                onClick={executeUpdate}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                    </svg>
                    Confirm Update
                  </span>
                )}
              </button>
              <button
                className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
