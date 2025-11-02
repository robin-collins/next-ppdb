import { render, screen } from '@testing-library/react'

describe('sanity', () => {
  it('renders a sample button for smoke testing', () => {
    render(<button>Test Button</button>)
    expect(
      screen.getByRole('button', { name: /test button/i })
    ).toBeInTheDocument()
  })
})
