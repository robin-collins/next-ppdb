'use client'
import Link from 'next/link'

interface AnimalHeaderProps {
  customer: {
    id: number
    surname: string
    firstname?: string | null
    phone1?: string | null
    email?: string | null
  }
  animalName: string
}

export default function AnimalHeader({
  customer,
  animalName,
}: AnimalHeaderProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Animal: {animalName}</h2>
        <div className="flex items-center gap-2">
          <Link className="btn btn-outline" href={`/customer/${customer.id}`}>
            View Customer
          </Link>
        </div>
      </div>
      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <div className="info-label">Owner</div>
            <div className="info-value">
              {customer.firstname ? `${customer.firstname} ` : ''}
              {customer.surname}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">Phone</div>
            <div className="info-value">{customer.phone1 || '—'}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{customer.email || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
