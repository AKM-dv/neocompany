import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCMS } from '../../context/CMSContext'
import './BookingConfirmation.css'

export default function BookingConfirmation() {
  const navigate = useNavigate()
  const { formatCurrency } = useCMS()
  const { state } = useLocation()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!state?.ref) {
      navigate('/', { replace: true })
    }
  }, [state, navigate])

  if (!state?.ref) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.ref)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="confirm-wrap">
      <div className="confirm-inner fade-up">
        <div className="confirm-check" aria-hidden>
          <svg viewBox="0 0 64 64" className="check-svg">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              className="check-circle"
            />
            <path
              d="M18 34 L28 44 L46 22"
              fill="none"
              stroke="var(--success)"
              strokeWidth="3"
              strokeLinecap="round"
              className="check-path"
            />
          </svg>
        </div>
        <h1 className="confirm-title hero-font">Booking Confirmed!</h1>
        <p className="confirm-sub">We&apos;ve sent a confirmation to your email.</p>

        <div className="ref-card">
          <div className="ref-label">Your Booking Reference</div>
          <div className="ref-row">
            <span className="ref-code mono">{state.ref}</span>
            <button type="button" className="copy-btn" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="confirm-summary">
          <p>
            <strong>Date:</strong> {state.date}{' '}
            <span className="mono">{String(state.time || '').slice(0, 5)}</span>
          </p>
          <p>
            <strong>Total:</strong>{' '}
            <span className="mono">{formatCurrency(state.total)}</span>
          </p>
          <ul>
            {(state.items || []).map((i) => (
              <li key={i.serviceId}>
                {i.name} × {i.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div className="cod-note">
          Cash on Delivery: please keep the exact amount ready where possible.
        </div>

        <div className="confirm-actions">
          <Link to="/services" className="btn-outline">
            Book Another Service
          </Link>
          <Link to="/" className="text-link">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
