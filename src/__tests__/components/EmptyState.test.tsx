/**
 * Component Tests: EmptyState
 *
 * Tests for the EmptyState component shown before search
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '@/components/EmptyState'

describe('EmptyState', () => {
  const mockOnSuggestionClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the main heading', () => {
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    expect(
      screen.getByRole('heading', { name: /search for animals/i })
    ).toBeInTheDocument()
  })

  it('should render the search icon', () => {
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    // SVG elements are rendered
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render the instruction text', () => {
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    expect(
      screen.getByText(
        /enter an animal name, breed, or owner in the search box/i
      )
    ).toBeInTheDocument()
  })

  it('should render all suggestion buttons', () => {
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    const suggestions = ['Cody', 'Maltese', 'James', 'Active pets']
    suggestions.forEach(suggestion => {
      expect(
        screen.getByRole('button', { name: suggestion })
      ).toBeInTheDocument()
    })
  })

  it('should call onSuggestionClick when a suggestion button is clicked', async () => {
    const user = userEvent.setup()
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    const codyButton = screen.getByRole('button', { name: 'Cody' })
    await user.click(codyButton)

    expect(mockOnSuggestionClick).toHaveBeenCalledTimes(1)
    expect(mockOnSuggestionClick).toHaveBeenCalledWith('Cody')
  })

  it('should call onSuggestionClick with correct suggestion for each button', async () => {
    const user = userEvent.setup()
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    const malteseButton = screen.getByRole('button', { name: 'Maltese' })
    await user.click(malteseButton)

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('Maltese')

    const jamesButton = screen.getByRole('button', { name: 'James' })
    await user.click(jamesButton)

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('James')
  })

  it('should render the "Try searching for" section heading', () => {
    render(<EmptyState onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText(/try searching for:/i)).toBeInTheDocument()
  })
})
