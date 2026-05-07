import { useEffect, useState } from 'react'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import '../AdminLayout.css'
import { FiMapPin, FiClock, FiUser, FiPhone, FiMail, FiExternalLink } from 'react-icons/fi'

const STATUSES = ['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export default function ManageBookings() {
  const { formatCurrency } = useCMS()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [cityId, setCityId] = useState('')
  const [q, setQ] = useState('')
  const [cities, setCities] = useState([])
  const [detail, setDetail] = useState(null)
  const [seenBookingId, setSeenBookingId] = useState(() => {
    const raw = Number(localStorage.getItem('admin_seen_booking_id') || 0)
    return Number.isFinite(raw) ? raw : 0
  })

  const load = () => {
    const params = {}
    if (status) params.status = status
    if (cityId) params.city_id = cityId
    if (q) params.q = q
    client.get('/api/admin/bookings', { params }).then((r) => setRows(r.data || []))
  }

  useEffect(() => {
    client.get('/api/admin/cities').then((r) => setCities(r.data || []))
  }, [])

  useEffect(() => {
    load()
  }, [status, cityId])

  useEffect(() => {
    const refreshSeen = () => {
      const raw = Number(localStorage.getItem('admin_seen_booking_id') || 0)
      setSeenBookingId(Number.isFinite(raw) ? raw : 0)
    }
    window.addEventListener('storage', refreshSeen)
    window.addEventListener('focus', refreshSeen)
    return () => {
      window.removeEventListener('storage', refreshSeen)
      window.removeEventListener('focus', refreshSeen)
    }
  }, [])

  const search = () => load()

  const openDetail = async (id) => {
    const { data } = await client.get(`/api/admin/bookings/${id}`)
    setDetail(data)
    const currentSeen = Number(localStorage.getItem('admin_seen_booking_id') || 0)
    if (id > currentSeen) {
      localStorage.setItem('admin_seen_booking_id', String(id))
      setSeenBookingId(id)
    }
  }

  const saveDetail = async (e) => {
    e.preventDefault()
    if (!detail) return
    await client.put(`/api/admin/bookings/${detail.id}/status`, {
      status: detail.status,
      admin_notes: detail.admin_notes,
    })
    setDetail(null)
    load()
  }

  const hasCoords =
    detail &&
    detail.user_latitude !== null &&
    detail.user_latitude !== undefined &&
    detail.user_longitude !== null &&
    detail.user_longitude !== undefined &&
    detail.user_latitude !== '' &&
    detail.user_longitude !== ''

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="admin-field" style={{ margin: 0 }}>
            <label>Status</label>
            <select
              className="admin-input"
              style={{ width: 160 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s || 'all'} value={s}>
                  {s || 'All'}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <label>City</label>
            <select
              className="admin-input"
              style={{ width: 160 }}
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
            >
              <option value="">All</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-field" style={{ margin: 0 }}>
            <label>Search</label>
            <input
              className="admin-input"
              style={{ width: 200 }}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ref / name / email"
            />
          </div>
          <button type="button" className="admin-btn admin-btn-primary" onClick={search}>
            Apply
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={load}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Customer</th>
              <th>Email</th>
              <th>City</th>
              <th>Scheduled</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                style={Number(r.id) > seenBookingId ? { background: 'color-mix(in srgb, var(--admin-accent) 10%, transparent)' } : undefined}
              >
                <td className="mono">
                  {r.booking_ref}
                  {Number(r.id) > seenBookingId && (
                    <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--admin-accent)' }}>
                      NEW
                    </span>
                  )}
                </td>
                <td>{r.guest_name}</td>
                <td>{r.guest_email}</td>
                <td>
                  {r.city_name} / {r.area_name}
                </td>
                <td>
                  {r.scheduled_date}{' '}
                  <span className="mono">{String(r.scheduled_time || '').slice(0, 5)}</span>
                </td>
                <td className="mono">{formatCurrency(r.total_amount)}</td>
                <td>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => openDetail(r.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <>
          <button
            type="button"
            aria-label="Close"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.5)',
              border: 'none',
              zIndex: 130,
            }}
            onClick={() => setDetail(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="admin-card"
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 140,
              width: 'min(680px, 94vw)',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <button type="button" className="admin-modal-close" aria-label="Close modal" onClick={() => setDetail(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>Booking {detail.booking_ref}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
              <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, padding: 10, background: 'var(--admin-surface-2)' }}>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 4 }}>Total Amount</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{formatCurrency(detail.total_amount || 0)}</div>
              </div>
              <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, padding: 10, background: 'var(--admin-surface-2)' }}>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginBottom: 4 }}>Current Status</div>
                <div><span className={`badge badge-${detail.status}`}>{detail.status}</span></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
                  <FiUser /> <strong>Guest:</strong> {detail.guest_name}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
                  <FiMail /> <strong>Email:</strong> {detail.guest_email}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
                  <FiPhone /> <strong>Phone:</strong> {detail.guest_phone}
                </p>
                <p>
                  <strong>Address:</strong> {detail.address}
                </p>
                <div style={{ marginTop: 10, border: '1px solid var(--admin-border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--admin-surface-2)' }}>
                    <strong style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <FiMapPin />
                      Location Preview
                    </strong>
                    {hasCoords && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${detail.user_latitude},${detail.user_longitude}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--admin-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                      >
                        Open in Google Maps <FiExternalLink />
                      </a>
                    )}
                  </div>
                  {hasCoords ? (
                    <>
                      <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--admin-border)', fontSize: 12 }}>
                        <span className="mono">
                          {Number(detail.user_latitude).toFixed(6)}, {Number(detail.user_longitude).toFixed(6)}
                        </span>
                      </div>
                      <iframe
                        title="Booking location map"
                        src={buildOsmEmbed(detail.user_latitude, detail.user_longitude)}
                        style={{ width: '100%', height: 210, border: 'none', display: 'block' }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </>
                  ) : (
                    <div style={{ padding: 12, fontSize: 13, color: 'var(--admin-muted)' }}>
                      Customer location was not captured for this booking.
                    </div>
                  )}
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <FiClock />
                  <strong>When:</strong> {String(detail.scheduled_date)} {String(detail.scheduled_time || '').slice(0, 5)}
                </p>
              </div>
              <div>
                <strong>Items</strong>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {(detail.items || []).map((it, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      {it.service_name} × {it.quantity} —{' '}
                      <span className="mono">{formatCurrency(it.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <form onSubmit={saveDetail}>
              <div className="admin-field">
                <label>Status</label>
                <select
                  className="admin-input"
                  value={detail.status}
                  onChange={(e) => setDetail({ ...detail, status: e.target.value })}
                >
                  {STATUSES.filter(Boolean).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label>Admin notes</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={detail.admin_notes || ''}
                  onChange={(e) => setDetail({ ...detail, admin_notes: e.target.value })}
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary">
                Update Booking
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

function buildOsmEmbed(lat, lon) {
  const la = Number(lat)
  const lo = Number(lon)
  const d = 0.01
  const left = lo - d
  const right = lo + d
  const top = la + d
  const bottom = la - d
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${la}%2C${lo}`
}
