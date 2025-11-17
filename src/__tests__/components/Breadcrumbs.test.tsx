/**
 * Component Tests: Breadcrumbs
 *
 * Tests for the Breadcrumbs navigation component
 */

import { render, screen } from '@testing-library/react'
import Breadcrumbs from '@/components/Breadcrumbs'

describe('Breadcrumbs', () => {
  it('should render a single breadcrumb item', () => {
    render(<Breadcrumbs items={[{ label: 'Home' }]} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('should render multiple breadcrumb items with separators', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/customers' },
          { label: 'Details' },
        ]}
      />
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Customers')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()

    // Check for separators (/)
    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
  })

  it('should render links for non-current items with href', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Customers', href: '/customers' },
          { label: 'Details' },
        ]}
      />
    )

    const homeLink = screen.getByRole('link', { name: 'Home' })
    expect(homeLink).toHaveAttribute('href', '/')

    const customersLink = screen.getByRole('link', { name: 'Customers' })
    expect(customersLink).toHaveAttribute('href', '/customers')
  })

  it('should not render a link for the last item', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Details' }]}
      />
    )

    // Home should be a link
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()

    // Details (last item) should not be a link
    const detailsText = screen.getByText('Details')
    expect(detailsText.tagName).not.toBe('A')
  })

  it('should apply breadcrumb-current class to last item', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Current Page' }]}
      />
    )

    const currentItem = screen.getByText('Current Page')
    expect(currentItem).toHaveClass('breadcrumb-current')
  })

  it('should render with aria-label for accessibility', () => {
    render(
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
    )

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeInTheDocument()
  })

  it('should handle items without href', () => {
    render(
      <Breadcrumbs
        items={[{ label: 'Non-link Item 1' }, { label: 'Non-link Item 2' }]}
      />
    )

    expect(screen.getByText('Non-link Item 1')).toBeInTheDocument()
    expect(screen.getByText('Non-link Item 2')).toBeInTheDocument()

    // Should not have any links
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
