import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useCart } from '../../context/CartContext'
import { useCMS } from '../../context/CMSContext'
import './Checkout.css'

function formatHourLabel(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  if (h < 12) return `${h} AM`
  return `${h - 12} PM`
}

/** Hourly slots inclusive; defaults 6–23 (6:00 AM–11:00 PM). Configurable in Admin → Branding. */
function buildBookingSlots(startRaw, endRaw) {
  let start = Number(startRaw)
  let end = Number(endRaw)
  if (!Number.isFinite(start)) start = 6
  if (!Number.isFinite(end)) end = 23
  start = Math.max(0, Math.min(23, Math.round(start)))
  end = Math.max(0, Math.min(23, Math.round(end)))
  if (start > end) [start, end] = [end, start]
  const slots = []
  for (let h = start; h <= end; h += 1) {
    slots.push({
      value: `${String(h).padStart(2, '0')}:00:00`,
      label: formatHourLabel(h),
      unavailable: false,
    })
  }
  return slots
}

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { formatCurrency, cms } = useCMS()
  const slots = useMemo(
    () => buildBookingSlots(cms.booking_hour_start, cms.booking_hour_end),
    [cms.booking_hour_start, cms.booking_hour_end],
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [geoLoading, setGeoLoading] = useState(false)

  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    address: '',
    scheduled_date: tomorrowISO(),
    scheduled_time: '',
    user_latitude: '',
    user_longitude: '',
  })

  const minDate = useMemo(() => tomorrowISO(), [])

  useEffect(() => {
    setForm((f) => {
      if (!f.scheduled_time) return f
      const ok = slots.some((s) => s.value === f.scheduled_time && !s.unavailable)
      return ok ? f : { ...f, scheduled_time: '' }
    })
  }, [slots])

  const isFormReady =
    Boolean(form.guest_name.trim()) &&
    Boolean(form.guest_phone.trim()) &&
    Boolean(form.address.trim()) &&
    Boolean(form.scheduled_date) &&
    Boolean(form.scheduled_time) &&
    items.length > 0

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, form: 'Geolocation is not supported in this browser.' }))
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          user_latitude: String(pos.coords.latitude),
          user_longitude: String(pos.coords.longitude),
        }))
        setGeoLoading(false)
      },
      () => {
        setGeoLoading(false)
        setErrors((prev) => ({ ...prev, form: 'Unable to get your location. You can continue without it.' }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (!items.length) {
      setErrors({ form: 'Your cart is empty.' })
      return
    }
    const next = {}
    if (!form.guest_name.trim()) next.guest_name = 'Required'
    if (!form.guest_phone.trim()) next.guest_phone = 'Required'
    if (!form.address.trim()) next.address = 'Required'
    if (!form.scheduled_date) next.scheduled_date = 'Required'
    if (!form.scheduled_time) next.scheduled_time = 'Required'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setLoading(true)
    try {
      const payload = {
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim(),
        guest_phone: form.guest_phone.trim(),
        address: form.address.trim(),
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        payment_method: 'COD',
        items: items.map((i) => ({
          service_id: i.serviceId,
          quantity: i.quantity,
        })),
        user_latitude: form.user_latitude || undefined,
        user_longitude: form.user_longitude || undefined,
      }
      const { data } = await client.post('/api/bookings', payload)
      clearCart()
      navigate('/booking/confirmed', {
        state: {
          ref: data.booking_ref,
          total: data.total_amount,
          date: data.scheduled_date,
          time: data.scheduled_time,
          items,
          user_latitude: data.user_latitude,
          user_longitude: data.user_longitude,
        },
      })
    } catch (err) {
      setErrors({
        form: err.response?.data?.error || err.message || 'Order failed',
      })
    } finally {
      setLoading(false)
    }
  }

  const testCheckout = async () => {
    if (!items.length) {
      setErrors({ form: 'Add at least one item to run test checkout.' })
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const now = new Date()
      const testDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const payload = {
        guest_name: 'Test User',
        guest_email: 'test.user@example.com',
        guest_phone: '9999999999',
        address: 'Test checkout address, Demo Street',
        scheduled_date: testDate,
        scheduled_time: '10:00:00',
        payment_method: 'COD',
        items: items.map((i) => ({
          service_id: i.serviceId,
          quantity: i.quantity,
        })),
        user_latitude: 19.076,
        user_longitude: 72.8777,
      }
      const { data } = await client.post('/api/bookings', payload)
      clearCart()
      navigate('/booking/confirmed', {
        state: {
          ref: data.booking_ref,
          total: data.total_amount,
          date: data.scheduled_date,
          time: data.scheduled_time,
          items,
          user_latitude: data.user_latitude,
          user_longitude: data.user_longitude,
        },
      })
    } catch (err) {
      setErrors({
        form: err.response?.data?.error || err.message || 'Test checkout failed',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="container checkout-empty">
        <h1 className="hero-font">Your cart is empty</h1>
        <Link to="/services" className="btn-hero-inline">
          Browse services
        </Link>
      </div>
    )
  }

  return (
    <div className="container checkout-page">
      <div className="checkout-progress">
        <span className="done">1 Cart</span>
        <span className="sep">→</span>
        <span className="current">2 Details</span>
        <span className="sep">→</span>
        <span>3 Confirm</span>
      </div>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={submit} noValidate>
          <h2 className="form-section-title">Your Details</h2>
          <div className="field">
            <label htmlFor="guest_name">Full Name</label>
            <input
              id="guest_name"
              name="guest_name"
              value={form.guest_name}
              onChange={onChange}
              autoComplete="name"
            />
            {errors.guest_name && (
              <span className="field-error">{errors.guest_name}</span>
            )}
          </div>
          <div className="field">
            <label htmlFor="guest_email">Email (optional)</label>
            <input
              id="guest_email"
              name="guest_email"
              type="email"
              value={form.guest_email}
              onChange={onChange}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="guest_phone">Phone</label>
            <input
              id="guest_phone"
              name="guest_phone"
              value={form.guest_phone}
              onChange={onChange}
              autoComplete="tel"
            />
            {errors.guest_phone && (
              <span className="field-error">{errors.guest_phone}</span>
            )}
          </div>

          <h2 className="form-section-title">Service Location</h2>
          <div className="field">
            <label htmlFor="address">Full Address</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={form.address}
              onChange={onChange}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>
          <div className="field">
            <label>Location pin (optional)</label>
            <div className="geo-row">
              <button type="button" className="geo-btn" onClick={useCurrentLocation} disabled={geoLoading}>
                {geoLoading ? 'Fetching location...' : 'Use Current Location'}
              </button>
              {form.user_latitude && form.user_longitude ? (
                <span className="geo-coord mono">
                  {Number(form.user_latitude).toFixed(5)}, {Number(form.user_longitude).toFixed(5)}
                </span>
              ) : (
                <span className="geo-muted">No location attached</span>
              )}
            </div>
          </div>

          <h2 className="form-section-title">Schedule</h2>
          <p className="schedule-window-hint">
            Bookings are available from{' '}
            <strong>
              {formatHourLabel(
                Number.isFinite(Number(cms.booking_hour_start)) ? Number(cms.booking_hour_start) : 6,
              )}
            </strong>{' '}
            to{' '}
            <strong>
              {formatHourLabel(Number.isFinite(Number(cms.booking_hour_end)) ? Number(cms.booking_hour_end) : 23)}
            </strong>{' '}
            (hourly slots). Multiple bookings are welcome — there is no cap on how many you place.
          </p>
          <div className="field">
            <label htmlFor="scheduled_date">Date</label>
            <input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              min={minDate}
              value={form.scheduled_date}
              onChange={onChange}
            />
            {errors.scheduled_date && (
              <span className="field-error">{errors.scheduled_date}</span>
            )}
          </div>
          <div className="field">
            <div className="slot-label">Time slot</div>
            <div className="time-grid">
              {slots.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={s.unavailable}
                  className={`time-slot ${
                    form.scheduled_time === s.value ? 'active' : ''
                  } ${s.unavailable ? 'unavailable' : ''}`}
                  onClick={() =>
                    setForm((f) => (!s.unavailable ? { ...f, scheduled_time: s.value } : f))
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
            {errors.scheduled_time && (
              <span className="field-error">{errors.scheduled_time}</span>
            )}
          </div>

          <h2 className="form-section-title">Payment Method</h2>
          <div className="cod-box">
            <strong>Cash on Delivery</strong>
            <span title="Pay when the service is completed">ℹ️</span>
          </div>

          {errors.form && <p className="form-global-error">{errors.form}</p>}

          <button type="submit" className="visually-hidden-submit" tabIndex={-1}>
            Submit
          </button>
        </form>

        <aside className="checkout-summary">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-preview-top">
              <div className="summary-chip">Premium booking preview</div>
              <div className="summary-subtle">Fast confirm + COD</div>
            </div>
            <ul className="summary-lines">
              {items.map((i) => (
                <li key={i.serviceId}>
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span className="mono">
                    {formatCurrency(Number(i.price) * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="mono">{formatCurrency(subtotal)}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span className="mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="cod-pill">Cash on Delivery</div>
            {form.user_latitude && form.user_longitude && (
              <div className="summary-map-card">
                <div className="summary-map-head">
                  <strong>Location Preview</strong>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${form.user_latitude},${form.user_longitude}`)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </div>
                <iframe
                  title="Booking location preview"
                  src={buildOsmEmbed(form.user_latitude, form.user_longitude)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            <button
              type="button"
              className="place-order-btn"
              disabled={loading}
              onClick={submit}
            >
              {loading ? 'Placing…' : 'Place Order'}
            </button>
            <button
              type="button"
              className="test-order-btn"
              disabled={loading}
              onClick={testCheckout}
            >
              {loading ? 'Testing…' : 'Test Checkout (Dummy Booking)'}
            </button>
          </div>
        </aside>
      </div>
      <div className="mobile-checkout-bar">
        <button
          type="button"
          className="mobile-checkout-btn"
          disabled={loading || !isFormReady}
          onClick={submit}
        >
          {loading ? 'Placing…' : `Checkout ${formatCurrency(subtotal)}`}
        </button>
      </div>
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
