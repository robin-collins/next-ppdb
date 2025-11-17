/**
 * Test Fixtures: Service Notes
 *
 * Sample service note data for testing
 * Note: animalID will be set when seeding
 */

export const testNotes = [
  {
    notes: 'Full grooming service completed. Dog was very cooperative.',
    date: '2024-02-15',
    // animalID will be set during seeding
  },
  {
    notes: 'Bath and nail trim. Applied flea treatment as requested.',
    date: '2024-02-20',
  },
  {
    notes: 'Haircut and styling. Customer very happy with results.',
    date: '2024-02-25',
  },
  {
    notes: 'Basic wash and dry. Dog was nervous but handled well.',
    date: '2024-03-01',
  },
  {
    notes: 'Full groom including ear cleaning. No issues.',
    date: '2024-03-05',
  },
  {
    notes: 'Special shampoo used for sensitive skin. Great results.',
    date: '2024-03-10',
  },
  {
    notes: 'First time visit. Introduction to grooming went smoothly.',
    date: '2024-03-12',
  },
  {
    notes: 'Regular maintenance groom. Same style as always.',
    date: '2024-03-14',
  },
  {
    notes: 'Extra time spent on matted fur. Recommend more frequent visits.',
    date: '2024-03-16',
  },
  {
    notes: 'Quick trim and nail care. In and out in 30 minutes.',
    date: '2024-03-18',
  },
]

/**
 * Single note for minimal test cases
 */
export const singleNote = {
  notes: 'Test service note',
  date: '2024-01-01',
}

/**
 * Note with edge case values
 */
export const edgeCaseNote = {
  notes: `Very long service note that contains extensive details about the grooming session. 
  This note includes information about the dog's behavior, the specific services provided, 
  any issues encountered, recommendations for future visits, and general observations. 
  The purpose is to test how the system handles very long text entries in the notes field. 
  This could include multiple paragraphs, special characters like @#$%^&*(), 
  and even some numbers 1234567890. It should handle all of this without any problems.
  Additional paragraph to make it even longer and test the limits of the text field.
  Another line with more details about the grooming session and the animal's condition.
  Final line with closing remarks and recommendations for next visit.`,
  date: '2024-12-31',
}

/**
 * Note with minimal values
 */
export const minimalNote = {
  notes: 'A',
  date: '2024-01-01',
}

/**
 * Note with empty content (should not be allowed but test anyway)
 */
export const emptyNote = {
  notes: '',
  date: '2024-01-01',
}

/**
 * Recent notes for timeline testing
 */
export const recentNotes = [
  {
    notes: 'Most recent visit - full groom',
    date: new Date().toISOString().split('T')[0], // Today
  },
  {
    notes: 'Previous visit - bath only',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 7 days ago
  },
  {
    notes: 'Earlier visit - full service',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 14 days ago
  },
  {
    notes: 'Initial visit - introduction',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days ago
  },
]
