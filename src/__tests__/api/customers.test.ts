/**
 * @jest-environment node
 *
 * API Tests: Customers
 *
 * Tests for /api/customers endpoints (GET, POST)
 * and /api/customers/[id] endpoints (GET, PUT, DELETE)
 */

import {
  GET as searchCustomers,
  POST as createCustomer,
} from '@/app/api/customers/route'
import {
  GET as getCustomerById,
  PUT as updateCustomer,
  DELETE as deleteCustomer,
} from '@/app/api/customers/[id]/route'
import { createMockRequest, parseResponseJSON } from '../helpers/api'

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    animal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    breed: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    notes: {
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('API: /api/customers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers', () => {
    it('should return empty results for empty query', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([])
      mockPrisma.customer.count.mockResolvedValue(0)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        query: { q: '' },
      })

      const response = await searchCustomers(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.customers).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('should return customers matching search query', async () => {
      const mockCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john@example.com',
        animal: [
          {
            animalID: 1,
            animalname: 'Max',
            SEX: 'Male',
            breed: {
              breedID: 1,
              breedname: 'Golden Retriever',
            },
          },
        ],
      }

      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer])
      mockPrisma.customer.count.mockResolvedValue(1)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        query: { q: 'Smith', page: '1' },
      })

      const response = await searchCustomers(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.customers).toHaveLength(1)
      expect(data.customers[0].surname).toBe('Smith')
      expect(data.customers[0].animals).toHaveLength(1)
    })

    it('should search by phone number', async () => {
      const mockCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john@example.com',
        animal: [],
      }

      mockPrisma.customer.findMany.mockResolvedValue([mockCustomer])
      mockPrisma.customer.count.mockResolvedValue(1)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        query: { q: '555-0101' },
      })

      const response = await searchCustomers(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.customers).toHaveLength(1)
    })

    it('should handle pagination correctly', async () => {
      const mockCustomers = Array.from({ length: 25 }, (_, i) => ({
        customerID: i + 1,
        surname: `Customer${i + 1}`,
        firstname: 'Test',
        address: '123 Test St',
        suburb: 'Testville',
        postcode: 1000,
        phone1: '5550100',
        phone2: '',
        phone3: '',
        email: `test${i + 1}@example.com`,
        animal: [],
      }))

      mockPrisma.customer.findMany.mockResolvedValue(mockCustomers)
      mockPrisma.customer.count.mockResolvedValue(25)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        query: { q: 'Test', page: '2' },
      })

      const response = await searchCustomers(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.total).toBe(25)
    })
  })

  describe('POST /api/customers', () => {
    it('should create a new customer with valid data', async () => {
      const newCustomer = {
        surname: 'Johnson',
        firstname: 'Sarah',
        address: '456 Oak Ave',
        suburb: 'Riverside',
        postcode: '2345',
        phone1: '555-0102',
        phone2: '',
        phone3: '',
        email: 'sarah@example.com',
      }

      const mockCreatedCustomer = {
        customerID: 1,
        surname: 'Johnson',
        firstname: 'Sarah',
        address: '456 Oak Ave',
        suburb: 'Riverside',
        postcode: 2345,
        phone1: '5550102',
        phone2: '',
        phone3: '',
        email: 'sarah@example.com',
        animal: [],
      }

      mockPrisma.customer.create.mockResolvedValue(mockCreatedCustomer)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: newCustomer,
      })

      const response = await createCustomer(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(201)
      expect(data.surname).toBe('Johnson')
      expect(data.firstname).toBe('Sarah')
      expect(mockPrisma.customer.create).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const invalidCustomer = {
        firstname: 'Sarah',
      }

      const request = createMockRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: invalidCustomer,
      })

      const response = await createCustomer(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    it('should normalize phone numbers on creation', async () => {
      const newCustomer = {
        surname: 'Test',
        firstname: 'User',
        address: '123 Test St',
        suburb: 'Testville',
        postcode: '1000',
        phone1: '555-1234',
        phone2: '555-9998',
        phone3: '',
        email: 'test@example.com',
      }

      const mockCreatedCustomer = {
        customerID: 1,
        surname: 'Test',
        firstname: 'User',
        address: '123 Test St',
        suburb: 'Testville',
        postcode: 1000,
        phone1: '5551234',
        phone2: '5559998',
        phone3: '',
        email: 'test@example.com',
        animal: [],
      }

      mockPrisma.customer.create.mockResolvedValue(mockCreatedCustomer)

      const request = createMockRequest('http://localhost:3000/api/customers', {
        method: 'POST',
        body: newCustomer,
      })

      const response = await createCustomer(request)
      await parseResponseJSON(response)

      expect(response.status).toBe(201)
      expect(mockPrisma.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            phone1: '5551234',
            phone2: '5559998',
          }),
        })
      )
    })
  })
})

describe('API: /api/customers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers/[id]', () => {
    it('should return customer details by ID', async () => {
      const mockCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john@example.com',
        animal: [
          {
            animalID: 1,
            animalname: 'Max',
            SEX: 'Male',
            colour: 'Golden',
            cost: 45.0,
            lastvisit: new Date('2024-01-15'),
            thisvisit: new Date('2024-02-15'),
            comments: 'Very friendly',
            breed: {
              breedID: 1,
              breedname: 'Golden Retriever',
            },
            notes: [],
          },
        ],
      }

      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer)

      const request = createMockRequest(
        'http://localhost:3000/api/customers/1',
        { params: { id: '1' } }
      )

      const response = await getCustomerById(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.id).toBe(1)
      expect(data.surname).toBe('Smith')
      expect(data.animals).toHaveLength(1)
    })

    it('should return 404 for non-existent customer', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null)

      const request = createMockRequest(
        'http://localhost:3000/api/customers/9999',
        { params: { id: '9999' } }
      )

      const response = await getCustomerById(request, {
        params: Promise.resolve({ id: '9999' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(404)
      expect(data.error).toBe('Customer not found')
    })
  })

  describe('PUT /api/customers/[id]', () => {
    it('should update customer details', async () => {
      const updateData = {
        surname: 'Smith-Updated',
        email: 'john.updated@example.com',
      }

      const mockExistingCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '5550102',
        phone3: null,
        email: 'john@example.com',
        animal: [
          {
            animalID: 1,
            animalname: 'Max',
            SEX: 'Male',
            colour: 'Golden',
            cost: 45.0,
            lastvisit: new Date('2024-01-15'),
            thisvisit: new Date('2024-02-15'),
            comments: 'Friendly',
            breedID: 1,
            breed: { breedname: 'Golden Retriever' },
            notes: [],
          },
        ],
      }

      const mockUpdatedCustomer = {
        customerID: 1,
        surname: 'Smith-Updated',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john.updated@example.com',
        animal: [],
      }

      mockPrisma.customer.findUnique.mockResolvedValue(mockExistingCustomer)
      mockPrisma.customer.update.mockResolvedValue(mockUpdatedCustomer)
      mockPrisma.animal.findMany.mockResolvedValue([])

      const request = createMockRequest(
        'http://localhost:3000/api/customers/1',
        {
          method: 'PUT',
          body: updateData,
          params: { id: '1' },
        }
      )

      const response = await updateCustomer(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.surname).toBe('Smith-Updated')
      expect(data.email).toBe('john.updated@example.com')
      expect(mockPrisma.customer.findUnique).toHaveBeenCalled()
      expect(mockPrisma.customer.update).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/customers/[id]', () => {
    it('should delete customer when no animals exist', async () => {
      const mockExistingCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john@example.com',
        animal: [],
      }

      // Mock findUnique to return customer with no animals
      // Also mock findMany for safety as it might be used
      mockPrisma.customer.findUnique.mockResolvedValue(mockExistingCustomer)
      mockPrisma.animal.findMany.mockResolvedValue([])
      mockPrisma.animal.deleteMany.mockResolvedValue({ count: 0 })
      mockPrisma.customer.delete.mockResolvedValue(mockExistingCustomer)

      const request = createMockRequest(
        'http://localhost:3000/api/customers/1',
        {
          method: 'DELETE',
          params: { id: '1' },
        }
      )

      const response = await deleteCustomer(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.message).toBe('Customer deleted successfully')
      expect(mockPrisma.customer.findUnique).toHaveBeenCalled()
      expect(mockPrisma.customer.delete).toHaveBeenCalled()
    })

    it('should return 400 when customer has associated animals', async () => {
      const mockExistingCustomer = {
        customerID: 1,
        surname: 'Smith',
        firstname: 'John',
        address: '123 Main St',
        suburb: 'Springfield',
        postcode: 1234,
        phone1: '5550101',
        phone2: '',
        phone3: '',
        email: 'john@example.com',
        animal: [
          { animalID: 1, animalname: 'Max', notes: [] },
          { animalID: 2, animalname: 'Bella', notes: [] },
          { animalID: 3, animalname: 'Charlie', notes: [] },
        ],
      }

      // Mock findUnique and findMany
      mockPrisma.customer.findUnique.mockResolvedValue(mockExistingCustomer)
      mockPrisma.animal.findMany.mockResolvedValue(mockExistingCustomer.animal)
      mockPrisma.animal.deleteMany.mockResolvedValue({ count: 0 })
      mockPrisma.notes.deleteMany.mockResolvedValue({ count: 0 })

      const request = createMockRequest(
        'http://localhost:3000/api/customers/1',
        {
          method: 'DELETE',
          params: { id: '1' },
        }
      )

      const response = await deleteCustomer(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('Cannot delete customer')
      expect(mockPrisma.customer.findUnique).toHaveBeenCalled()
      expect(mockPrisma.customer.delete).not.toHaveBeenCalled()
    })
  })
})
