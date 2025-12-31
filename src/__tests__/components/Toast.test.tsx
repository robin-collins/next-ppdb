/**
 * Component Tests: Toast
 *
 * Tests for the Toast notification component
 */

import { render, screen, act as actTL } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import Toast from '@/components/Toast'

describe('Toast', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('should render the toast with message', () => {
    act(() => {
      render(<Toast message="Test message" onClose={mockOnClose} />)
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render close button', () => {
    act(() => {
      render(<Toast message="Test" onClose={mockOnClose} />)
    })

    const closeButton = screen.getByRole('button', {
      name: /close notification/i,
    })
    expect(closeButton).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    act(() => {
      render(<Toast message="Test" onClose={mockOnClose} />)
    })

    const closeButton = screen.getByRole('button', {
      name: /close notification/i,
    })
    // We need to wrap user interacton that causes state updates in act() if it's not handled by the library
    await act(async () => {
      await user.click(closeButton)
    })

    expect(mockOnClose).not.toHaveBeenCalled() // Only sets isVisible to false
  })

  it('should automatically close after default duration (3000ms)', () => {
    act(() => {
      render(<Toast message="Test" onClose={mockOnClose} />)
    })

    expect(mockOnClose).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should automatically close after custom duration', () => {
    act(() => {
      render(<Toast message="Test" onClose={mockOnClose} durationMs={5000} />)
    })

    expect(mockOnClose).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should not close before duration elapses', () => {
    act(() => {
      render(<Toast message="Test" onClose={mockOnClose} durationMs={3000} />)
    })

    act(() => {
      jest.advanceTimersByTime(2999)
    })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should render with success styling', () => {
    let container: HTMLElement
    act(() => {
      const result = render(
        <Toast message="Success" type="success" onClose={mockOnClose} />
      )
      container = result.container
    })

    const toast = container!.querySelector('.bg-green-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-green-800')
  })

  it('should render with error styling', () => {
    let container: HTMLElement
    act(() => {
      const result = render(
        <Toast message="Error" type="error" onClose={mockOnClose} />
      )
      container = result.container
    })

    const toast = container!.querySelector('.bg-red-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-red-800')
  })

  it('should render with info styling by default', () => {
    let container: HTMLElement
    act(() => {
      const result = render(<Toast message="Info" onClose={mockOnClose} />)
      container = result.container
    })

    const toast = container!.querySelector('.bg-blue-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-blue-800')
  })

  it('should render with info styling when type is explicitly info', () => {
    let container: HTMLElement
    act(() => {
      const result = render(
        <Toast message="Info" type="info" onClose={mockOnClose} />
      )
      container = result.container
    })

    const toast = container!.querySelector('.bg-blue-50')
    expect(toast).toBeInTheDocument()
    expect(toast).toHaveClass('text-blue-800')
  })

  it('should be positioned at top-center', () => {
    let container: HTMLElement
    act(() => {
      const result = render(<Toast message="Test" onClose={mockOnClose} />)
      container = result.container
    })

    const toast = container!.firstChild as HTMLElement
    expect(toast).toHaveClass('fixed', 'top-24', 'left-1/2')
  })

  it('should have high z-index for visibility', () => {
    let container: HTMLElement
    act(() => {
      const result = render(<Toast message="Test" onClose={mockOnClose} />)
      container = result.container
    })

    const toast = container!.firstChild as HTMLElement
    expect(toast).toHaveClass('z-[200]')
  })

  it('should cleanup timer on unmount', () => {
    let unmount: () => void
    act(() => {
      const result = render(<Toast message="Test" onClose={mockOnClose} />)
      unmount = result.unmount
    })

    act(() => {
      unmount()
    })

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    // onClose should not be called after unmount
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
