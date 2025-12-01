// src/app/api/customers/[id]/animals/count/route.ts - Get count of animals for a customer
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const customerID = parseInt(id)

  if (isNaN(customerID)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
  }

  const count = await prisma.animal.count({
    where: { customerID },
  })

  return NextResponse.json({ count })
}
