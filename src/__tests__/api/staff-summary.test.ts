/**
 * @jest-environment node
 *
 * API Tests: Staff Summary Endpoint
 *
 * Tests for GET /api/reports/staff-summary
 */

import { GET } from '@/app/api/reports/staff-summary/route'
import { createMockRequest, parseResponseJSON } from '../helpers/api'

// Mock the Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    animal: {
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
  },
}))

import { prisma } from '@/lib/prisma'
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('API: /api/reports/staff-summary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/reports/staff-summary', () => {
    it('should return staff summary for a date with data', async () => {
      const mockAnimals = [
        {
          animalID: 1,
          breed: { breedname: 'Maltese' },
          notes: [{ notes: 'full groom HM' }],
        },
        {
          animalID: 2,
          breed: { breedname: 'Poodle' },
          notes: [{ notes: 'wash and dry $55 CC' }],
        },
        {
          animalID: 3,
          breed: { breedname: 'Maltese' },
          notes: [{ notes: 'clip CC' }],
        },
      ]

      mockPrisma.animal.findMany.mockResolvedValue(mockAnimals as never)

      const request = createMockRequest(
        'http://localhost:3000/api/reports/staff-summary?date=2024-02-15'
      )

      const response = await GET(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.date).toMatch(/2024-02-1[45]/)
      expect(data.staff).toBeInstanceOf(Array)
      expect(data.staff.length).toBe(2)

      // Check HM has 1 Maltese
      const hmStaff = data.staff.find(
        (s: { initials: string }) => s.initials === 'HM'
      )
      expect(hmStaff).toBeDefined()
      expect(hmStaff.totalAnimals).toBe(1)
      expect(hmStaff.breeds['Maltese']).toBe(1)

      // Check CC has 1 Poodle and 1 Maltese
      const ccStaff = data.staff.find(
        (s: { initials: string }) => s.initials === 'CC'
      )
      expect(ccStaff).toBeDefined()
      expect(ccStaff.totalAnimals).toBe(2)
      expect(ccStaff.breeds['Poodle']).toBe(1)
      expect(ccStaff.breeds['Maltese']).toBe(1)
    })

    it('should return empty staff array when no animals have notes with initials', async () => {
      const mockAnimals = [
        {
          animalID: 1,
          breed: { breedname: 'Maltese' },
          notes: [{ notes: 'just a note without initials' }],
        },
      ]

      mockPrisma.animal.findMany.mockResolvedValue(mockAnimals as never)

      const request = createMockRequest(
        'http://localhost:3000/api/reports/staff-summary?date=2024-02-15'
      )

      const response = await GET(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.staff).toEqual([])
    })

    it('should count each animal only once per staff member', async () => {
      // Animal 1 has multiple notes by same staff member
      const mockAnimals = [
        {
          animalID: 1,
          breed: { breedname: 'Maltese' },
          notes: [
            { notes: 'wash CC' },
            { notes: 'clip CC' },
            { notes: 'dry CC' },
          ],
        },
      ]

      mockPrisma.animal.findMany.mockResolvedValue(mockAnimals as never)

      const request = createMockRequest(
        'http://localhost:3000/api/reports/staff-summary?date=2024-02-15'
      )

      const response = await GET(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      const ccStaff = data.staff.find(
        (s: { initials: string }) => s.initials === 'CC'
      )
      expect(ccStaff.totalAnimals).toBe(1) // Should only count once
    })

    it('should return 400 for invalid date format', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/reports/staff-summary?date=invalid'
      )

      const response = await GET(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD')
    })

    it('should default to today when no date provided', async () => {
      mockPrisma.animal.findMany.mockResolvedValue([])

      const request = createMockRequest(
        'http://localhost:3000/api/reports/staff-summary'
      )

      const response = await GET(request)
      const data = await parseResponseJSON(response)

      expect(response.status).toBe(200)
      expect(data.date).toBeDefined()
      expect(data.staff).toEqual([])
    })
  })
})
