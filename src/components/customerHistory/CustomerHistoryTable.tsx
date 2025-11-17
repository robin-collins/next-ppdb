'use client'

interface CustomerRow {
  id: number
  surname: string
  firstname: string | null
  email: string | null
  phone1: string | null
  phone2: string | null
  phone3: string | null
  latestVisit: string | null
  monthsSince: number | null
}

interface Props {
  rows: CustomerRow[]
}

export default function CustomerHistoryTable({ rows }: Props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Inactive Customers</h3>
      </div>
      <div className="card-content overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Surname</th>
              <th>Firstname</th>
              <th>Latest Visit</th>
              <th>Months Since</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.surname}</td>
                <td>{r.firstname || '—'}</td>
                <td>
                  {r.latestVisit
                    ? new Date(r.latestVisit).toLocaleDateString()
                    : '—'}
                </td>
                <td>{r.monthsSince ?? '—'}</td>
                <td>{r.email || '—'}</td>
                <td>{r.phone1 || r.phone2 || r.phone3 || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
