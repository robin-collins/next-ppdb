/**
 * Mock Utilities
 *
 * Provides reusable mock implementations for Prisma client and other dependencies.
 * Use these mocks in unit tests to isolate code from external dependencies.
 */

import type { PrismaClient } from '@/generated/prisma'

/**
 * Create a mocked Prisma client for unit tests
 * Returns a mock object with all common Prisma methods
 */
export function mockPrismaClient() {
  return {
    animal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    customer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    breed: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    notes: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>
}

/**
 * Create a Prisma error with specific error code
 * Useful for testing error handling paths
 */
export function mockPrismaError(
  code: string,
  meta?: Record<string, unknown>
): Error {
  const error = new Error('Prisma error') as Error & {
    code: string
    meta?: Record<string, unknown>
  }
  error.code = code
  error.meta = meta
  return error
}

/**
 * Common Prisma error codes for testing
 */
export const PrismaErrorCodes = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  REQUIRED_FIELD_MISSING: 'P2012',
  INVALID_VALUE: 'P2007',
} as const

/**
 * Reset all Prisma mocks
 * Call this in beforeEach to ensure test isolation
 */
export function resetPrismaMocks(mockPrisma: jest.Mocked<PrismaClient>): void {
  // Reset all animal mocks
  Object.values(mockPrisma.animal).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      ;(mock as jest.Mock).mockReset()
    }
  })

  // Reset all customer mocks
  Object.values(mockPrisma.customer).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      ;(mock as jest.Mock).mockReset()
    }
  })

  // Reset all breed mocks
  Object.values(mockPrisma.breed).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      ;(mock as jest.Mock).mockReset()
    }
  })

  // Reset all notes mocks
  Object.values(mockPrisma.notes).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      ;(mock as jest.Mock).mockReset()
    }
  })

  // Reset utility mocks
  ;(mockPrisma.$disconnect as jest.Mock).mockReset()
  ;(mockPrisma.$connect as jest.Mock).mockReset()
  ;(mockPrisma.$executeRaw as jest.Mock).mockReset()
  ;(mockPrisma.$queryRaw as jest.Mock).mockReset()
  ;(mockPrisma.$transaction as jest.Mock).mockReset()
}

/**
 * Mock localStorage for tests
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
}

/**
 * Mock fetch for API tests
 */
export function mockFetch() {
  return jest.fn((url: string | URL | Request, _init?: RequestInit) =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: typeof url === 'string' ? url : url.toString(),
      clone: function () {
        return this
      },
      body: null,
      bodyUsed: false,
    } as Response)
  )
}

/**
 * Create a mock Next.js router
 */
export function mockNextRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
    basePath: '',
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  }
}
