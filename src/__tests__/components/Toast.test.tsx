/**
 * Component Tests: Toast
 *
 * Tests for the Toast notification component
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '@/components/Toast'

describe('Toast', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render the toast with message', () => {
    render(<Toast message="Test message" onClose={mockOnClose} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(<Toast message="Test" onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: '×' })
    expect(closeButton).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    render(<Toast message="Test" onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: '×' })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should automatically close after default duration (3000ms)', () => {
    render(<Toast message="Test" onClose={mockOnClose} />)

    expect(mockOnClose).not.toHaveBeenCalled()

    jest.advanceTimersByTime(3000)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should automatically close after custom duration', () => {
    render(<Toast message="Test" onClose={mockOnClose} durationMs={5000} />)

    expect(mockOnClose).not.toHaveBeenCalled()

    jest.advanceTimersByTime(5000)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not close before duration elapses', () => {
    render(<Toast message="Test" onClose={mockOnClose} durationMs={3000} />)

    jest.advanceTimersByTime(2999)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should render with success styling', () => {
    const { container } = render(
      <Toast message="Success" type="success" onClose={mockOnClose} />
    )

    const toast = container.querySelector('.bg-green-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-green-700')
  })

  it('should render with error styling', () => {
    const { container } = render(
      <Toast message="Error" type="error" onClose={mockOnClose} />
    )

    const toast = container.querySelector('.bg-red-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-red-700')
  })

  it('should render with info styling by default', () => {
    const { container } = render(<Toast message="Info" onClose={mockOnClose} />)

    const toast = container.querySelector('.bg-gray-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-gray-800')
  })

  it('should render with info styling when type is explicitly info', () => {
    const { container } = render(
      <Toast message="Info" type="info" onClose={mockOnClose} />
    )

    const toast = container.querySelector('.bg-gray-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-gray-800')
  })

  it('should be positioned at bottom-right', () => {
    const { container } = render(<Toast message="Test" onClose={mockOnClose} />)

    const toast = container.firstChild as HTMLElement
    expect(toast).toHaveClass('fixed', 'right-6', 'bottom-6')
  })

  it('should have high z-index for visibility', () => {
    const { container } = render(<Toast message="Test" onClose={mockOnClose} />)

    const toast = container.firstChild as HTMLElement
    expect(toast).toHaveClass('z-[400]')
  })

  it('should cleanup timer on unmount', () => {
    const { unmount } = render(<Toast message="Test" onClose={mockOnClose} />)

    unmount()

    jest.advanceTimersByTime(3000)

    // onClose should not be called after unmount
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
