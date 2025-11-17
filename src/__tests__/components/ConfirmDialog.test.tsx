/**
 * Component Tests: ConfirmDialog
 *
 * Tests for the ConfirmDialog modal component
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '@/components/ConfirmDialog'

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when open is false', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('should render default title', () => {
    render(
      <ConfirmDialog
        open={true}
        message="Test message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(
      <ConfirmDialog
        open={true}
        title="Delete Customer"
        message="Are you sure?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Delete Customer')).toBeInTheDocument()
  })

  it('should render the message', () => {
    render(
      <ConfirmDialog
        open={true}
        message="Are you sure you want to delete this item?"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(
      screen.getByText('Are you sure you want to delete this item?')
    ).toBeInTheDocument()
  })

  it('should render default confirm and cancel button text', () => {
    render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should render custom confirm and cancel button text', () => {
    render(
      <ConfirmDialog
        open={true}
        message="Test"
        confirmText="Delete"
        cancelText="Go Back"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnCancel).not.toHaveBeenCalled()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('should call onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    await user.keyboard('{Escape}')

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('should not call onCancel on Escape when dialog is closed', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmDialog
        open={false}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    await user.keyboard('{Escape}')

    expect(mockOnCancel).not.toHaveBeenCalled()
  })

  it('should have backdrop overlay', () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const backdrop = container.querySelector('.bg-black\\/30')
    expect(backdrop).toBeInTheDocument()
  })

  it('should be positioned in center of screen', () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const overlay = container.firstChild as HTMLElement
    expect(overlay).toHaveClass(
      'fixed',
      'inset-0',
      'items-center',
      'justify-center'
    )
  })

  it('should have high z-index', () => {
    const { container } = render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    const overlay = container.firstChild as HTMLElement
    expect(overlay).toHaveClass('z-[300]')
  })

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = render(
      <ConfirmDialog
        open={true}
        message="Test"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    )

    removeEventListenerSpy.mockRestore()
  })
})
