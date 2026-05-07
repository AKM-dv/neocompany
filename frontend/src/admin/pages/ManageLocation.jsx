import { useEffect, useMemo, useState } from 'react'
import client from '../../api/client'
import '../AdminLayout.css'

const blankCity = {
  name: '',
  state: '',
  country: '',
  support_phone: '',
  city_pincode: '',
  base_fee: '',
  min_booking_amount: '',
  avg_eta_minutes: 60,
  priority: 0,
  is_active: true,
}

export default function ManageLocation() {
  const [cities, setCities] = useState([])
  const [cityForm, setCityForm] = useState(blankCity)
  const [editingCityId, setEditingCityId] = useState(null)

  const loadCities = () =>
    client.get('/api/admin/cities').then((r) => setCities(r.data || []))

  useEffect(() => {
    loadCities()
  }, [])

  const saveCity = async (e) => {
    e.preventDefault()
    if (editingCityId) await client.put(`/api/admin/cities/${editingCityId}`, cityForm)
    else await client.post('/api/admin/cities', cityForm)
    setCityForm(blankCity)
    setEditingCityId(null)
    loadCities()
  }

  const startEditCity = (city) => {
    setEditingCityId(city.id)
    setCityForm({
      name: city.name || '',
      state: city.state || '',
      country: city.country || '',
      support_phone: city.support_phone || '',
      city_pincode: city.city_pincode || '',
      base_fee: city.base_fee ?? '',
      min_booking_amount: city.min_booking_amount ?? '',
      avg_eta_minutes: city.avg_eta_minutes ?? 60,
      priority: city.priority ?? 0,
      is_active: !!city.is_active,
    })
  }

  const toggleCity = async (c) => {
    await client.put(`/api/admin/cities/${c.id}`, { is_active: !c.is_active })
    loadCities()
  }

  const cityMapQuery = useMemo(() => {
    const parts = [cityForm.city_pincode, cityForm.name, cityForm.state, cityForm.country]
      .filter(Boolean)
      .join(', ')
      .trim()
    return parts
  }, [cityForm.city_pincode, cityForm.name, cityForm.state, cityForm.country])

  const cityMapEmbed = cityMapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(cityMapQuery)}&z=12&output=embed`
    : ''

  const cityMapLink = cityMapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cityMapQuery)}`
    : ''

  return (
    <div>
      <div className="admin-card" style={{ maxWidth: 1080 }}>
        <h2 style={{ marginTop: 0, marginBottom: 4 }}>City Management</h2>
        <p style={{ marginTop: 0, marginBottom: 14, color: 'var(--admin-muted)', fontSize: 13 }}>
          Configure serviceable cities with clear booking and operational details.
        </p>

        <form onSubmit={saveCity} style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="City Name" hint="Public city name shown in checkout">
              <input className="admin-input" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} required />
            </Field>
            <Field label="State / Region" hint="Optional internal and display detail">
              <input className="admin-input" value={cityForm.state} onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })} />
            </Field>
            <Field label="Country" hint="Default: India (or your operating country)">
              <input className="admin-input" value={cityForm.country} onChange={(e) => setCityForm({ ...cityForm, country: e.target.value })} />
            </Field>
            <Field label="Support Phone" hint="Optional customer support contact">
              <input className="admin-input" value={cityForm.support_phone} onChange={(e) => setCityForm({ ...cityForm, support_phone: e.target.value })} />
            </Field>
            <Field label="City Pincode / ZIP" hint="Used for map lookup and quick coverage reference">
              <input className="admin-input" value={cityForm.city_pincode} onChange={(e) => setCityForm({ ...cityForm, city_pincode: e.target.value })} />
            </Field>
            <Field label="Base Service Fee" hint="Flat fee applied for this city">
              <input className="admin-input" type="text" inputMode="decimal" value={cityForm.base_fee} onChange={(e) => setCityForm({ ...cityForm, base_fee: e.target.value })} />
            </Field>
            <Field label="Minimum Booking Amount" hint="Minimum checkout amount required">
              <input className="admin-input" type="text" inputMode="decimal" value={cityForm.min_booking_amount} onChange={(e) => setCityForm({ ...cityForm, min_booking_amount: e.target.value })} />
            </Field>
            <Field label="Average ETA (Minutes)" hint="Expected average arrival time">
              <input className="admin-input" type="text" inputMode="numeric" value={cityForm.avg_eta_minutes} onChange={(e) => setCityForm({ ...cityForm, avg_eta_minutes: e.target.value })} />
            </Field>
            <Field label="Display Priority" hint="Lower number appears first in list">
              <input className="admin-input" type="text" inputMode="numeric" value={cityForm.priority} onChange={(e) => setCityForm({ ...cityForm, priority: e.target.value })} />
            </Field>
          </div>
          {cityMapEmbed && (
            <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, overflow: 'hidden', background: 'var(--admin-surface-2)' }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--admin-border)', fontSize: 12, color: 'var(--admin-muted)' }}>
                Map preview based on city + pincode
              </div>
              <iframe
                title="City map preview"
                src={cityMapEmbed}
                width="100%"
                height="180"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div style={{ padding: '6px 8px', borderTop: '1px solid var(--admin-border)' }}>
                <a href={cityMapLink} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--admin-accent)', fontWeight: 600 }}>
                  Open full map
                </a>
              </div>
            </div>
          )}
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', border: '1px solid var(--admin-border)', borderRadius: 10 }}>
            <input type="checkbox" checked={!!cityForm.is_active} onChange={(e) => setCityForm({ ...cityForm, is_active: e.target.checked })} />
            Active for bookings
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="admin-btn admin-btn-primary">{editingCityId ? 'Update City' : 'Add City'}</button>
            {editingCityId && <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { setEditingCityId(null); setCityForm(blankCity) }}>Cancel</button>}
          </div>
        </form>
        <h3 style={{ marginTop: 8, marginBottom: 10 }}>Configured Cities</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {cities.map((c) => (
            <li
              key={c.id}
              style={{
                padding: '12px 12px',
                borderRadius: 10,
                background: 'var(--admin-surface-2)',
                border: '1px solid var(--admin-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <strong>{c.name}</strong>
                <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 2 }}>
                  {[c.state, c.country].filter(Boolean).join(', ') || 'Add optional location data'} {c.city_pincode ? `· PIN ${c.city_pincode}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {c.city_pincode && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.city_pincode, c.name, c.state, c.country].filter(Boolean).join(', '))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn admin-btn-ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Map
                  </a>
                )}
                <button type="button" className="admin-btn admin-btn-ghost" onClick={(e) => { e.stopPropagation(); startEditCity(c) }}>Edit</button>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={(e) => { e.stopPropagation(); toggleCity(c) }}>{c.is_active ? 'On' : 'Off'}</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="admin-field" style={{ marginBottom: 0 }}>
      <label>{label}</label>
      {children}
      {hint ? <div style={{ marginTop: 4, fontSize: 11, color: 'var(--admin-muted)' }}>{hint}</div> : null}
    </div>
  )
}
