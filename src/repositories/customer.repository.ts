/**
 * Customer Repository - Prisma Implementation
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import type {
  ICustomerRepository,
  CustomerWithAnimals,
  SearchOptions,
} from './types'

export class CustomerRepository implements ICustomerRepository {
  async findById(id: number): Promise<CustomerWithAnimals | null> {
    return prisma.customer.findUnique({
      where: { customerID: id },
      include: { animal: true },
    })
  }

  async findByIdBasic(
    id: number
  ): Promise<Prisma.customerGetPayload<object> | null> {
    return prisma.customer.findUnique({
      where: { customerID: id },
    })
  }

  async findMany(options: SearchOptions): Promise<{
    customers: CustomerWithAnimals[]
    total: number
  }> {
    const { query, page, limit } = options

    const where = this.buildSearchConditions(query)

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { animal: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { surname: 'asc' },
      }),
      prisma.customer.count({ where }),
    ])

    return { customers, total }
  }

  async create(data: Prisma.customerCreateInput): Promise<CustomerWithAnimals> {
    return prisma.customer.create({
      data,
      include: { animal: true },
    })
  }

  async update(
    id: number,
    data: Prisma.customerUpdateInput
  ): Promise<CustomerWithAnimals> {
    return prisma.customer.update({
      where: { customerID: id },
      data,
      include: { animal: true },
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.customer.delete({
      where: { customerID: id },
    })
  }

  async search(query: string): Promise<CustomerWithAnimals[]> {
    const where = this.buildSearchConditions(query)
    return prisma.customer.findMany({
      where,
      include: { animal: true },
      take: 20,
      orderBy: { surname: 'asc' },
    })
  }

  private buildSearchConditions(query: string): Prisma.customerWhereInput {
    if (!query) return {}

    const normalizedQuery = query.replace(/[\s\-\(\)]/g, '')
    const isPhoneQuery = /^\d[\d\s\-\(\)]*\d$/.test(query) && query.length >= 4

    const orConditions: Prisma.customerWhereInput[] = []

    if (!isPhoneQuery) {
      orConditions.push(
        { surname: { contains: query } },
        { firstname: { contains: query } },
        { email: { contains: query } },
        { suburb: { contains: query } }
      )
    }

    if (isPhoneQuery) {
      orConditions.push(
        { phone1: { contains: normalizedQuery } },
        { phone2: { contains: normalizedQuery } },
        { phone3: { contains: normalizedQuery } }
      )
    }

    return orConditions.length > 0 ? { OR: orConditions } : {}
  }
}

// Export singleton instance
export const customerRepository = new CustomerRepository()
