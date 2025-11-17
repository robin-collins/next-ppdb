/**
 * Test Fixtures: Animals
 *
 * Sample animal data for testing
 * Note: breedID and customerID will be set when seeding
 */

export const testAnimals = [
  {
    animalname: 'Max',
    SEX: 'Male' as 'Male' | 'Female',
    colour: 'Golden',
    lastvisit: '2024-01-15',
    thisvisit: '2024-02-15',
    comments: 'Very friendly dog, loves treats',
    cost: 45.0,
    // breedID and customerID will be set during seeding
  },
  {
    animalname: 'Bella',
    SEX: 'Female' as 'Male' | 'Female',
    colour: 'White',
    lastvisit: '2024-01-20',
    thisvisit: '2024-02-20',
    comments: 'Nervous around strangers',
    cost: 50.0,
  },
  {
    animalname: 'Charlie',
    SEX: 'Male' as 'Male' | 'Female',
    colour: 'Black',
    lastvisit: '2024-01-25',
    thisvisit: '2024-02-25',
    comments: 'Requires extra brushing',
    cost: 42.0,
  },
  {
    animalname: 'Luna',
    SEX: 'Female' as 'Male' | 'Female',
    colour: 'Brown',
    lastvisit: '2024-02-01',
    thisvisit: '2024-03-01',
    comments: 'Very energetic',
    cost: 48.0,
  },
  {
    animalname: 'Cooper',
    SEX: 'Male' as 'Male' | 'Female',
    colour: 'Tan',
    lastvisit: '2024-02-05',
    thisvisit: '2024-03-05',
    comments: 'Good behavior',
    cost: 38.0,
  },
  {
    animalname: 'Daisy',
    SEX: 'Female' as 'Male' | 'Female',
    colour: 'Mixed',
    lastvisit: '2024-02-10',
    thisvisit: '2024-03-10',
    comments: 'Sensitive skin, use special shampoo',
    cost: 40.0,
  },
  {
    animalname: 'Rocky',
    SEX: 'Male' as 'Male' | 'Female',
    colour: 'Grey',
    lastvisit: '2024-02-12',
    thisvisit: '2024-03-12',
    comments: 'First visit, very calm',
    cost: 35.0,
  },
  {
    animalname: 'Molly',
    SEX: 'Female' as 'Male' | 'Female',
    colour: 'Cream',
    lastvisit: '2024-02-14',
    thisvisit: '2024-03-14',
    comments: 'Regular customer',
    cost: 32.0,
  },
  {
    animalname: 'Buddy',
    SEX: 'Male' as 'Male' | 'Female',
    colour: 'Red',
    lastvisit: '2024-02-16',
    thisvisit: '2024-03-16',
    comments: 'Loves water baths',
    cost: 43.0,
  },
  {
    animalname: 'Lucy',
    SEX: 'Female' as 'Male' | 'Female',
    colour: 'White and Black',
    lastvisit: '2024-02-18',
    thisvisit: '2024-03-18',
    comments: 'Needs nail trim',
    cost: 45.0,
  },
]

/**
 * Single animal for minimal test cases
 */
export const singleAnimal = {
  animalname: 'TestPet',
  SEX: 'Male' as 'Male' | 'Female',
  colour: 'Brown',
  lastvisit: '2024-01-01',
  thisvisit: '2024-02-01',
  comments: 'Test animal',
  cost: 40.0,
}

/**
 * Animal with edge case values
 */
export const edgeCaseAnimal = {
  animalname: 'VeryLongAnimalNameThatTestsMaximumLength',
  SEX: 'Female' as 'Male' | 'Female',
  colour: 'Very Long Colour Description That Tests Maximum Length',
  lastvisit: '2024-12-31',
  thisvisit: '2024-12-31',
  comments:
    'Very long comments field that contains a lot of text to test the maximum length and ensure that the database can handle long comments without truncation or errors. This should be a realistic scenario where a groomer adds detailed notes about the animal.',
  cost: 999.99,
}

/**
 * Animal with minimal values
 */
export const minimalAnimal = {
  animalname: 'A',
  SEX: 'Male' as 'Male' | 'Female',
  colour: '',
  lastvisit: '0000-00-00',
  thisvisit: '0000-00-00',
  comments: '',
  cost: 0.0,
}

/**
 * Animal with invalid date (legacy data)
 */
export const animalWithInvalidDate = {
  animalname: 'LegacyPet',
  SEX: 'Female' as 'Male' | 'Female',
  colour: 'Black',
  lastvisit: '0000-00-00',
  thisvisit: '0000-00-00',
  comments: 'Legacy data with invalid dates',
  cost: 30.0,
}

/**
 * Animal with recent visits
 */
export const recentAnimal = {
  animalname: 'RecentPet',
  SEX: 'Male' as 'Male' | 'Female',
  colour: 'White',
  lastvisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0], // 7 days ago
  thisvisit: new Date().toISOString().split('T')[0], // Today
  comments: 'Recent visit',
  cost: 45.0,
}
