import { useEffect, useMemo, useState } from 'react'
import client from '../../api/client'
import '../AdminLayout.css'

export default function ContactMessages() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    client
      .get('/api/admin/contact-messages')
      .then((r) => setRows(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!q.trim()) return rows
    const needle = q.toLowerCase()
    return rows.filter((r) => {
      return (
        String(r.name || '').toLowerCase().includes(needle) ||
        String(r.email || '').toLowerCase().includes(needle) ||
        String(r.subject || '').toLowerCase().includes(needle) ||
        String(r.message || '').toLowerCase().includes(needle)
      )
    })
  }, [rows, q])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          className="admin-input"
          style={{ maxWidth: 300 }}
          placeholder="Search name, email, subject..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ color: 'var(--admin-muted)', fontSize: 13 }}>
          {filtered.length} message{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="admin-card admin-table-wrap">
        {loading ? (
          <p style={{ margin: 0 }}>Loading contact messages...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Page</th>
                <th>Received At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    <a href={`mailto:${r.email}`} style={{ color: 'var(--admin-accent)' }}>
                      {r.email}
                    </a>
                  </td>
                  <td>{r.subject || '—'}</td>
                  <td style={{ maxWidth: 360, whiteSpace: 'pre-wrap' }}>{r.message}</td>
                  <td style={{ maxWidth: 220 }}>
                    {r.page_url ? (
                      <a href={r.page_url} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-accent)' }}>
                        Open page
                      </a>
                    ) : '—'}
                  </td>
                  <td>{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
                    No contact messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function formatDateTime(v) {
  if (!v) return ''
  try {
    return new Date(v).toLocaleString()
  } catch {
    return String(v)
  }
}
