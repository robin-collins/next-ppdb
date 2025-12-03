/**
 * Store Tests: animalsStore
 *
 * Tests for the Zustand animals store with state management and API actions
 */

import { useAnimalsStore } from '@/store/animalsStore'

// Mock fetch globally
global.fetch = jest.fn()

describe('animalsStore', () => {
  beforeEach(() => {
    useAnimalsStore.setState({
      animals: [],
      selectedAnimal: null,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      searchParams: {},
      loading: false,
      mutating: false,
      error: null,
    })
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAnimalsStore.getState()
      expect(state.animals).toEqual([])
      expect(state.selectedAnimal).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.mutating).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Basic Setters', () => {
    it('should set animals', () => {
      const mockAnimals = [
        {
          id: 1,
          name: 'Max',
          breed: 'Golden',
          colour: 'Golden',
          sex: 'Male' as const,
          cost: 45,
          lastVisit: new Date(),
          thisVisit: new Date(),
          comments: 'Test',
          customer: { id: 10, surname: 'Smith', firstname: 'John' },
        },
      ]
      useAnimalsStore.getState().setAnimals(mockAnimals)
      expect(useAnimalsStore.getState().animals).toEqual(mockAnimals)
    })

    it('should set loading state', () => {
      useAnimalsStore.getState().setLoading(true)
      expect(useAnimalsStore.getState().loading).toBe(true)
    })

    it('should set mutating state', () => {
      useAnimalsStore.getState().setMutating(true)
      expect(useAnimalsStore.getState().mutating).toBe(true)
    })

    it('should set error', () => {
      useAnimalsStore.getState().setError('Test error')
      expect(useAnimalsStore.getState().error).toBe('Test error')
    })

    it('should clear search', () => {
      useAnimalsStore.setState({
        animals: [
          {
            id: 1,
            name: 'Test',
            breed: 'Test',
            sex: 'Male',
            colour: 'Brown',
            lastVisit: new Date(),
            thisVisit: new Date(),
            customer: { id: 1, surname: 'Test' },
          },
        ],
        searchParams: { q: 'test' },
      })
      useAnimalsStore.getState().clearSearch()
      expect(useAnimalsStore.getState().animals).toEqual([])
      expect(useAnimalsStore.getState().searchParams).toEqual({})
    })
  })

  describe('Search Animals', () => {
    it('should search animals successfully', async () => {
      const mockResponse = {
        animals: [{ id: 1, name: 'Max', breed: 'Golden' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await useAnimalsStore.getState().searchAnimals({ q: 'Max', page: 1 })

      const state = useAnimalsStore.getState()
      expect(state.animals).toEqual(mockResponse.animals)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle search error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await useAnimalsStore.getState().searchAnimals({ q: 'test' })

      expect(useAnimalsStore.getState().error).toBe('Failed to search animals')
    })
  })

  describe('Delete Animal - Error Re-throwing', () => {
    it('should re-throw error for caller handling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' }),
      })

      let errorThrown = false
      try {
        await useAnimalsStore.getState().deleteAnimal(1)
      } catch {
        errorThrown = true
      }

      expect(errorThrown).toBe(true)
      expect(useAnimalsStore.getState().error).toBe('Delete failed')
    })

    it('should clear mutating flag after operation', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await useAnimalsStore.getState().deleteAnimal(1)

      expect(useAnimalsStore.getState().mutating).toBe(false)
    })

    it('should clear mutating flag on error (finally block)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Delete failed' }),
      })

      try {
        await useAnimalsStore.getState().deleteAnimal(1)
      } catch {
        // Expected
      }

      expect(useAnimalsStore.getState().mutating).toBe(false)
    })
  })

  describe('Update Animal - Error Re-throwing', () => {
    it('should re-throw error for caller handling', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Update failed' }),
      })

      let errorThrown = false
      try {
        await useAnimalsStore.getState().updateAnimal(1, { name: 'Test' })
      } catch {
        errorThrown = true
      }

      expect(errorThrown).toBe(true)
      expect(useAnimalsStore.getState().error).toBe('Update failed')
    })

    it('should clear mutating flag after successful update', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test' }),
      })

      await useAnimalsStore.getState().updateAnimal(1, { name: 'Test' })

      expect(useAnimalsStore.getState().mutating).toBe(false)
    })
  })
})
