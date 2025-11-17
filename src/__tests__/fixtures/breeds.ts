/**
 * Test Fixtures: Breeds
 *
 * Sample breed data for testing
 */

export const testBreeds = [
  {
    breedname: 'Golden Retriever',
    avgtime: '90',
    avgcost: 45.0,
  },
  {
    breedname: 'Poodle',
    avgtime: '75',
    avgcost: 50.0,
  },
  {
    breedname: 'Labrador',
    avgtime: '80',
    avgcost: 42.0,
  },
  {
    breedname: 'German Shepherd',
    avgtime: '85',
    avgcost: 48.0,
  },
  {
    breedname: 'Beagle',
    avgtime: '60',
    avgcost: 38.0,
  },
  {
    breedname: 'Bulldog',
    avgtime: '65',
    avgcost: 40.0,
  },
  {
    breedname: 'Yorkshire Terrier',
    avgtime: '55',
    avgcost: 35.0,
  },
  {
    breedname: 'Dachshund',
    avgtime: '50',
    avgcost: 32.0,
  },
  {
    breedname: 'Boxer',
    avgtime: '75',
    avgcost: 43.0,
  },
  {
    breedname: 'Shih Tzu',
    avgtime: '70',
    avgcost: 45.0,
  },
]

/**
 * Single breed for minimal test cases
 */
export const singleBreed = {
  breedname: 'Test Breed',
  avgtime: '60',
  avgcost: 40.0,
}

/**
 * Breed with edge case values
 */
export const edgeCaseBreed = {
  breedname: 'Very Long Breed Name That Tests Maximum Length',
  avgtime: '999',
  avgcost: 999.99,
}

/**
 * Breed with minimal values
 */
export const minimalBreed = {
  breedname: 'A',
  avgtime: '1',
  avgcost: 0.01,
}
