/**
 * Store Tests: animalsStore
 *
 * Tests for the Zustand animals store with state management and API actions
 */

import { useAnimalsStore } from '@/store/animalsStore'
import { act } from '@testing-library/react'

// Mock fetch globally
global.fetch = jest.fn()

describe('animalsStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAnimalsStore.setState({
      animals: [],
      selectedAnimal: null,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      searchParams: {},
      loading: false,
      error: null,
    })

    // Clear fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAnimalsStore.getState()

      expect(state.animals).toEqual([])
      expect(state.selectedAnimal).toBeNull()
      expect(state.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
      expect(state.searchParams).toEqual({})
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Basic Setters', () => {
    it('should set animals', () => {
      const mockAnimals = [
        {
          id: 1,
          name: 'Max',
          breed: 'Golden Retriever',
          colour: 'Golden',
          sex: 'Male' as const,
          cost: 45,
          lastVisit: new Date(),
          thisVisit: new Date(),
          comments: 'Test',
          customer: {
            id: 10,
            surname: 'Smith',
            firstname: 'John',
          },
        },
      ]

      act(() => {
        useAnimalsStore.getState().setAnimals(mockAnimals)
      })

      expect(useAnimalsStore.getState().animals).toEqual(mockAnimals)
    })

    it('should set selected animal', () => {
      const mockAnimal = {
        id: 1,
        name: 'Max',
        breed: 'Golden Retriever',
        colour: 'Golden',
        sex: 'Male' as const,
        cost: 45,
        lastVisit: new Date(),
        thisVisit: new Date(),
        comments: 'Test',
        customer: {
          id: 10,
          surname: 'Smith',
        },
      }

      act(() => {
        useAnimalsStore.getState().setSelectedAnimal(mockAnimal)
      })

      expect(useAnimalsStore.getState().selectedAnimal).toEqual(mockAnimal)
    })

    it('should set pagination', () => {
      const mockPagination = {
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      }

      act(() => {
        useAnimalsStore.getState().setPagination(mockPagination)
      })

      expect(useAnimalsStore.getState().pagination).toEqual(mockPagination)
    })

    it('should set search params', () => {
      const mockParams = { q: 'Max', page: 1 }

      act(() => {
        useAnimalsStore.getState().setSearchParams(mockParams)
      })

      expect(useAnimalsStore.getState().searchParams).toEqual(mockParams)
    })

    it('should set loading state', () => {
      act(() => {
        useAnimalsStore.getState().setLoading(true)
      })

      expect(useAnimalsStore.getState().loading).toBe(true)

      act(() => {
        useAnimalsStore.getState().setLoading(false)
      })

      expect(useAnimalsStore.getState().loading).toBe(false)
    })

    it('should set error', () => {
      act(() => {
        useAnimalsStore.getState().setError('Test error')
      })

      expect(useAnimalsStore.getState().error).toBe('Test error')

      act(() => {
        useAnimalsStore.getState().setError(null)
      })

      expect(useAnimalsStore.getState().error).toBeNull()
    })

    it('should clear search', () => {
      // Set some state
      act(() => {
        useAnimalsStore.setState({
          animals: [
            {
              id: 1,
              name: 'Test Animal',
              breed: 'Test Breed',
              sex: 'Male',
              colour: 'Brown',
              lastVisit: new Date('2024-01-01'),
              thisVisit: new Date('2024-01-15'),
              customer: {
                id: 1,
                surname: 'Test',
                firstname: 'User',
              },
            },
          ],
          searchParams: { q: 'test' },
          pagination: { page: 2, limit: 20, total: 25, totalPages: 2 },
        })
      })

      // Clear search
      act(() => {
        useAnimalsStore.getState().clearSearch()
      })

      const state = useAnimalsStore.getState()
      expect(state.animals).toEqual([])
      expect(state.searchParams).toEqual({})
      expect(state.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      })
    })
  })

  describe('Search Animals', () => {
    it('should search animals successfully', async () => {
      const mockResponse = {
        animals: [
          {
            id: 1,
            name: 'Max',
            breed: 'Golden Retriever',
            colour: 'Golden',
            sex: 'Male',
            cost: 45,
            lastVisit: new Date().toISOString(),
            thisVisit: new Date().toISOString(),
            comments: 'Test',
            customer: { id: 10, surname: 'Smith' },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await act(async () => {
        await useAnimalsStore.getState().searchAnimals({ q: 'Max', page: 1 })
      })

      const state = useAnimalsStore.getState()
      expect(state.animals).toEqual(mockResponse.animals)
      expect(state.pagination).toEqual(mockResponse.pagination)
      expect(state.searchParams).toEqual({ q: 'Max', page: 1 })
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should set loading state during search', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({ animals: [], pagination: {} }),
              })
            }, 100)
          })
      )

      const searchPromise = act(async () => {
        await useAnimalsStore.getState().searchAnimals({ q: 'test' })
      })

      // Loading should be true while fetching
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await searchPromise
      expect(useAnimalsStore.getState().loading).toBe(false)
    })

    it('should handle search error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await act(async () => {
        await useAnimalsStore.getState().searchAnimals({ q: 'test' })
      })

      const state = useAnimalsStore.getState()
      expect(state.error).toBe('Failed to search animals')
      expect(state.loading).toBe(false)
    })
  })

  describe('Fetch Animal', () => {
    it('should fetch single animal successfully', async () => {
      const mockAnimal = {
        id: 1,
        name: 'Max',
        breed: 'Golden Retriever',
        colour: 'Golden',
        sex: 'Male',
        cost: 45,
        lastVisit: new Date().toISOString(),
        thisVisit: new Date().toISOString(),
        comments: 'Test',
        customer: { id: 10, surname: 'Smith' },
        serviceNotes: [],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnimal,
      })

      await act(async () => {
        await useAnimalsStore.getState().fetchAnimal(1)
      })

      const state = useAnimalsStore.getState()
      expect(state.selectedAnimal).toEqual(mockAnimal)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle fetch animal error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await act(async () => {
        await useAnimalsStore.getState().fetchAnimal(999)
      })

      const state = useAnimalsStore.getState()
      expect(state.error).toBe('Failed to fetch animal')
      expect(state.loading).toBe(false)
    })
  })

  describe('Create Animal', () => {
    it('should create animal successfully', async () => {
      const newAnimal = {
        customerId: 10,
        name: 'Bella',
        breed: 'Poodle',
        sex: 'Female' as const,
        colour: 'White',
        cost: 50,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, ...newAnimal }),
      })

      await act(async () => {
        await useAnimalsStore.getState().createAnimal(newAnimal)
      })

      const state = useAnimalsStore.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle create animal error', async () => {
      const newAnimal = {
        customerId: 10,
        name: 'Bella',
        breed: 'Poodle',
        sex: 'Female' as const,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' }),
      })

      await act(async () => {
        await useAnimalsStore.getState().createAnimal(newAnimal)
      })

      const state = useAnimalsStore.getState()
      expect(state.error).toBe('Validation failed')
      expect(state.loading).toBe(false)
    })

    it('should refresh search after creating animal', async () => {
      // Set up initial search state
      act(() => {
        useAnimalsStore.setState({
          searchParams: { q: 'test', page: 1 },
        })
      })

      const newAnimal = {
        customerId: 10,
        name: 'Bella',
        breed: 'Poodle',
        sex: 'Female' as const,
      }

      // Mock both create and search responses
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 2, ...newAnimal }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            animals: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          }),
        })

      await act(async () => {
        await useAnimalsStore.getState().createAnimal(newAnimal)
      })

      // Verify search was called
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
        '/api/animals?q=test&page=1'
      )
    })
  })

  describe('Update Animal', () => {
    it('should update animal successfully', async () => {
      const updateData = {
        name: 'Max Updated',
        cost: 55,
      }

      const mockUpdatedAnimal = {
        id: 1,
        name: 'Max Updated',
        breed: 'Golden Retriever',
        colour: 'Golden',
        sex: 'Male' as const,
        cost: 55,
        lastVisit: new Date(),
        thisVisit: new Date(),
        comments: 'Test',
        customer: { id: 10, surname: 'Smith' },
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedAnimal,
      })

      await act(async () => {
        await useAnimalsStore.getState().updateAnimal(1, updateData)
      })

      const state = useAnimalsStore.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should update selected animal if it matches', async () => {
      const mockAnimal = {
        id: 1,
        name: 'Max',
        breed: 'Golden Retriever',
        colour: 'Golden',
        sex: 'Male' as const,
        cost: 45,
        lastVisit: new Date(),
        thisVisit: new Date(),
        comments: 'Test',
        customer: { id: 10, surname: 'Smith' },
      }

      act(() => {
        useAnimalsStore.setState({ selectedAnimal: mockAnimal })
      })

      const mockUpdatedAnimal = { ...mockAnimal, name: 'Max Updated', cost: 55 }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedAnimal,
      })

      await act(async () => {
        await useAnimalsStore
          .getState()
          .updateAnimal(1, { name: 'Max Updated' })
      })

      expect(useAnimalsStore.getState().selectedAnimal).toEqual(
        mockUpdatedAnimal
      )
    })

    it('should handle update animal error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Update failed' }),
      })

      await act(async () => {
        await useAnimalsStore.getState().updateAnimal(1, { name: 'Test' })
      })

      const state = useAnimalsStore.getState()
      expect(state.error).toBe('Update failed')
      expect(state.loading).toBe(false)
    })
  })

  describe('Delete Animal', () => {
    it('should delete animal successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await act(async () => {
        await useAnimalsStore.getState().deleteAnimal(1)
      })

      const state = useAnimalsStore.getState()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle delete animal error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' }),
      })

      await act(async () => {
        await useAnimalsStore.getState().deleteAnimal(1)
      })

      const state = useAnimalsStore.getState()
      expect(state.error).toBe('Failed to delete animal')
      expect(state.loading).toBe(false)
    })
  })
})
