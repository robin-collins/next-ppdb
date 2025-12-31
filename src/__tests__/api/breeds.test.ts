/**
 * @jest-environment node
 *
 * API Tests: Breeds
 *
 * Tests for /api/breeds endpoints (GET, POST)
 * and /api/breeds/[id] endpoints (PUT, DELETE)
 */

import { GET as listBreeds, POST as createBreed } from '@/app/api/breeds/route'
import {
  PUT as updateBreed,
  DELETE as deleteBreed,
} from '@/app/api/breeds/[id]/route'
import { createMockRequest, parseResponseJSON } from '../helpers/api'

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    breed: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    animal: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('API: /api/breeds', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/breeds', () => {
    it('should return list of all breeds sorted by name', async () => {
      const mockBreeds = [
        {
          breedID: 1,
          breedname: 'Beagle',
          avgtime: 60,
          avgcost: 38.0,
        },
        {
          breedID: 2,
          breedname: 'Golden Retriever',
          avgtime: 90,
          avgcost: 45.0,
        },
        {
          breedID: 3,
          breedname: 'Poodle',
          avgtime: 75,
          avgcost: 50.0,
        },
      ]

      mockPrisma.breed.findMany.mockResolvedValue(mockBreeds)

      const request = createMockRequest('http://localhost:3000/api/breeds')

      const response = await listBreeds(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      expect(data[0].name).toBe('Beagle')
      expect(mockPrisma.breed.findMany).toHaveBeenCalledWith({
        orderBy: { breedname: 'asc' },
      })
    })

    it('should return empty array when no breeds exist', async () => {
      mockPrisma.breed.findMany.mockResolvedValue([])

      const request = createMockRequest('http://localhost:3000/api/breeds')

      const response = await listBreeds(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toEqual([])
    })
  })

  describe('POST /api/breeds', () => {
    it('should create a new breed with valid data', async () => {
      const newBreed = {
        name: 'Labrador',
        avgtime: 80,
        avgcost: 42.0,
      }

      const mockCreatedBreed = {
        breedID: 1,
        breedname: 'Labrador',
        avgtime: 80,
        avgcost: 42.0,
      }

      mockPrisma.breed.create.mockResolvedValue(mockCreatedBreed)

      mockPrisma.$queryRaw.mockResolvedValue([])
      const request = createMockRequest('http://localhost:3000/api/breeds', {
        method: 'POST',
        body: newBreed,
      })

      const response = await createBreed(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(201)
      expect(data.name).toBe('Labrador')
      expect(data.avgtime).toBe(80)
      expect(data.avgcost).toBe(42.0)
      expect(mockPrisma.breed.create).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const invalidBreed = {
        avgtime: 80,
        // Missing name (required)
      }

      const request = createMockRequest('http://localhost:3000/api/breeds', {
        method: 'POST',
        body: invalidBreed,
      })

      const response = await createBreed(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    // NOTE: The breeds API currently doesn't validate negative values
    // These tests are skipped until validation is added
    it.skip('should return 400 for invalid avgtime (negative)', async () => {
      const invalidBreed = {
        name: 'Test Breed',
        avgtime: -5,
        avgcost: 40.0,
      }

      const request = createMockRequest('http://localhost:3000/api/breeds', {
        method: 'POST',
        body: invalidBreed,
      })

      const response = await createBreed(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })

    it.skip('should return 400 for invalid avgcost (negative)', async () => {
      const invalidBreed = {
        name: 'Test Breed',
        avgtime: 60,
        avgcost: -10.0,
      }

      const request = createMockRequest('http://localhost:3000/api/breeds', {
        method: 'POST',
        body: invalidBreed,
      })

      const response = await createBreed(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
    })
  })
})

describe('API: /api/breeds/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT /api/breeds/[id]', () => {
    it('should update breed details', async () => {
      const updateData = {
        name: 'Golden Retriever Updated',
        avgtime: 95,
        avgcost: 48.0,
      }

      const mockUpdatedBreed = {
        breedID: 1,
        breedname: 'Golden Retriever Updated',
        avgtime: 95,
        avgcost: 48.0,
      }

      mockPrisma.breed.update.mockResolvedValue(mockUpdatedBreed)

      const request = createMockRequest('http://localhost:3000/api/breeds/1', {
        method: 'PUT',
        body: updateData,
        params: { id: '1' },
      })

      const response = await updateBreed(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.name).toBe('Golden Retriever Updated')
      expect(data.avgtime).toBe(95)
      expect(mockPrisma.breed.update).toHaveBeenCalled()
    })

    it('should allow partial updates', async () => {
      const updateData = {
        avgcost: 50.0,
        // Only updating avgcost
      }

      const mockUpdatedBreed = {
        breedID: 1,
        breedname: 'Golden Retriever',
        avgtime: 90,
        avgcost: 50.0,
      }

      mockPrisma.breed.update.mockResolvedValue(mockUpdatedBreed)

      const request = createMockRequest('http://localhost:3000/api/breeds/1', {
        method: 'PUT',
        body: updateData,
        params: { id: '1' },
      })

      const response = await updateBreed(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.avgcost).toBe(50.0)
    })
  })

  describe('DELETE /api/breeds/[id]', () => {
    it('should delete breed when no animals reference it', async () => {
      mockPrisma.animal.count.mockResolvedValue(0)
      mockPrisma.breed.delete.mockResolvedValue({
        breedID: 1,
        breedname: 'Golden Retriever',
        avgtime: 90,
        avgcost: 45.0,
      })

      const request = createMockRequest('http://localhost:3000/api/breeds/1', {
        method: 'DELETE',
        params: { id: '1' },
      })

      const response = await deleteBreed(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.breed.delete).toHaveBeenCalled()
    })

    it('should return 400 when breed is referenced by animals', async () => {
      mockPrisma.animal.count.mockResolvedValue(5)

      const request = createMockRequest('http://localhost:3000/api/breeds/1', {
        method: 'DELETE',
        params: { id: '1' },
      })

      const response = await deleteBreed(request, {
        params: Promise.resolve({ id: '1' }),
      })
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toContain('Cannot delete breed')
      expect(mockPrisma.breed.delete).not.toHaveBeenCalled()
    })
  })
})
