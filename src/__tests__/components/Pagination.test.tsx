/**
 * Component Tests: Pagination
 *
 * Tests for the Pagination component
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '@/components/Pagination'

describe('Pagination', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onChange={mockOnChange} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should not render when totalPages is less than 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={0} onChange={mockOnChange} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render pagination controls when totalPages > 1', () => {
    render(<Pagination page={1} totalPages={5} onChange={mockOnChange} />)

    expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    expect(screen.getByText('Page 1 / 5')).toBeInTheDocument()
  })

  it('should disable Prev button on first page', () => {
    render(<Pagination page={1} totalPages={3} onChange={mockOnChange} />)

    const prevButton = screen.getByRole('button', { name: 'Prev' })
    expect(prevButton).toBeDisabled()
  })

  it('should enable Prev button when not on first page', () => {
    render(<Pagination page={2} totalPages={3} onChange={mockOnChange} />)

    const prevButton = screen.getByRole('button', { name: 'Prev' })
    expect(prevButton).not.toBeDisabled()
  })

  it('should disable Next button on last page', () => {
    render(<Pagination page={3} totalPages={3} onChange={mockOnChange} />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).toBeDisabled()
  })

  it('should enable Next button when not on last page', () => {
    render(<Pagination page={1} totalPages={3} onChange={mockOnChange} />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    expect(nextButton).not.toBeDisabled()
  })

  it('should call onChange with previous page when Prev is clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination page={2} totalPages={3} onChange={mockOnChange} />)

    const prevButton = screen.getByRole('button', { name: 'Prev' })
    await user.click(prevButton)

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith(1)
  })

  it('should call onChange with next page when Next is clicked', async () => {
    const user = userEvent.setup()
    render(<Pagination page={2} totalPages={3} onChange={mockOnChange} />)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    await user.click(nextButton)

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith(3)
  })

  it('should display correct current page and total pages', () => {
    render(<Pagination page={7} totalPages={10} onChange={mockOnChange} />)

    expect(screen.getByText('Page 7 / 10')).toBeInTheDocument()
  })

  it('should handle navigation through multiple pages', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <Pagination page={1} totalPages={3} onChange={mockOnChange} />
    )

    // Click Next from page 1
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockOnChange).toHaveBeenCalledWith(2)

    // Simulate moving to page 2
    rerender(<Pagination page={2} totalPages={3} onChange={mockOnChange} />)
    mockOnChange.mockClear()

    // Click Next from page 2
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(mockOnChange).toHaveBeenCalledWith(3)

    // Simulate moving to page 3
    rerender(<Pagination page={3} totalPages={3} onChange={mockOnChange} />)
    mockOnChange.mockClear()

    // Click Prev from page 3
    await user.click(screen.getByRole('button', { name: 'Prev' }))
    expect(mockOnChange).toHaveBeenCalledWith(2)
  })
})
