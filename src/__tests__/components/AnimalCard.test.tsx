/**
 * Component Tests: AnimalCard
 *
 * Tests for the AnimalCard component used in search results
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import AnimalCard from '@/components/AnimalCard'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('AnimalCard', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }

  const mockAnimal = {
    id: 1,
    name: 'Max',
    breed: 'Golden Retriever',
    colour: 'Golden',
    customer: {
      id: 10,
      surname: 'Smith',
      firstname: 'John',
      address: '123 Main St',
      suburb: 'Springfield',
      postcode: 1234,
      phone1: '5550101',
      phone2: '5550102',
      phone3: null,
    },
    lastVisit: new Date('2024-01-15'),
    cost: 45.0,
  }

  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render animal name and breed', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument()
  })

  it('should render animal initials in avatar', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    // The initial 'M' should be in the avatar circle
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('should render customer name', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText(/Smith, John/i)).toBeInTheDocument()
  })

  it('should render customer address', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('should render customer suburb and postcode', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('Springfield')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('should format postcode with leading zeros', () => {
    const animalWithShortPostcode = {
      ...mockAnimal,
      customer: { ...mockAnimal.customer, postcode: 99 },
    }
    render(
      <AnimalCard animal={animalWithShortPostcode} onClick={mockOnClick} />
    )

    expect(screen.getByText('0099')).toBeInTheDocument()
  })

  it('should render phone numbers', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('5550101')).toBeInTheDocument()
    expect(screen.getByText('5550102')).toBeInTheDocument()
  })

  it('should render phone separator between multiple phones', () => {
    const { container } = render(
      <AnimalCard animal={mockAnimal} onClick={mockOnClick} />
    )

    // Check for pipe separator between phone numbers
    const separators = container.querySelectorAll('.mx-1')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('should render animal colour', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('Golden')).toBeInTheDocument()
  })

  it('should render formatted last visit date', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    // Date formatted as "Jan 15, 24"
    expect(screen.getByText(/Jan 15, 24/i)).toBeInTheDocument()
  })

  it('should call onClick when card is clicked', async () => {
    const user = userEvent.setup()
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    const card = screen.getByText('Max').closest('div[class*="cursor-pointer"]')
    await user.click(card!)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(mockOnClick).toHaveBeenCalledWith(1)
  })

  it('should navigate to customer page when customer area is clicked', async () => {
    const user = userEvent.setup()
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    const customerArea = screen
      .getByText(/Smith, John/i)
      .closest('.customer-area')
    await user.click(customerArea!)

    expect(mockRouter.push).toHaveBeenCalledWith('/customer/10')
    // Should NOT call the card's onClick
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should handle customer without firstname', () => {
    const animalNoFirstname = {
      ...mockAnimal,
      customer: { ...mockAnimal.customer, firstname: null },
    }
    render(<AnimalCard animal={animalNoFirstname} onClick={mockOnClick} />)

    // Should render surname only, without comma
    expect(screen.getByText('Smith')).toBeInTheDocument()
    expect(screen.queryByText(/Smith,/)).not.toBeInTheDocument()
  })

  it('should handle missing customer address', () => {
    const animalNoAddress = {
      ...mockAnimal,
      customer: { ...mockAnimal.customer, address: null },
    }
    render(<AnimalCard animal={animalNoAddress} onClick={mockOnClick} />)

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument()
  })

  it('should handle missing suburb and postcode', () => {
    const animalNoLocation = {
      ...mockAnimal,
      customer: { ...mockAnimal.customer, suburb: null, postcode: null },
    }
    render(<AnimalCard animal={animalNoLocation} onClick={mockOnClick} />)

    expect(screen.queryByText('Springfield')).not.toBeInTheDocument()
    expect(screen.queryByText('1234')).not.toBeInTheDocument()
  })

  it('should handle missing phone numbers', () => {
    const animalNoPhones = {
      ...mockAnimal,
      customer: {
        ...mockAnimal.customer,
        phone1: null,
        phone2: null,
        phone3: null,
      },
    }
    render(<AnimalCard animal={animalNoPhones} onClick={mockOnClick} />)

    expect(screen.queryByText('5550101')).not.toBeInTheDocument()
  })

  it('should display N/A for missing colour', () => {
    const animalNoColour = { ...mockAnimal, colour: null }
    render(<AnimalCard animal={animalNoColour} onClick={mockOnClick} />)

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should render Color and Last Visit labels', () => {
    render(<AnimalCard animal={mockAnimal} onClick={mockOnClick} />)

    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByText('Last Visit')).toBeInTheDocument()
  })
})
