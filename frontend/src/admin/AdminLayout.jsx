import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { useCMS } from '../context/CMSContext'
import { getAdminToastEventName } from './adminToast'
import PageTransitionOverlay from '../components/PageTransitionOverlay'
import { getAdminThemeCssVars } from './adminTheme'
import './AdminLayout.css'
import {
  FiGrid,
  FiTag,
  FiBriefcase,
  FiCalendar,
  FiSliders,
  FiImage,
  FiFileText,
  FiLogOut,
  FiExternalLink,
  FiMoon,
  FiSun,
  FiBookOpen,
  FiBarChart2,
  FiAward,
  FiMail,
} from 'react-icons/fi'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true, group: 'Overview' },
  { to: '/admin/categories', label: 'Categories', icon: FiTag, group: 'Catalog' },
  { to: '/admin/services', label: 'Services', icon: FiBriefcase, group: 'Catalog' },
  { to: '/admin/bookings', label: 'All Bookings', icon: FiCalendar, group: 'Bookings' },
  { to: '/admin/reports', label: 'Reports & Export', icon: FiBarChart2, group: 'Bookings' },
  { to: '/admin/site/branding', label: 'Branding Management', icon: FiAward, group: 'Site Management' },
  { to: '/admin/site/palettes', label: 'Color Palettes', icon: FiSliders, group: 'Site Management' },
  { to: '/admin/hero', label: 'Hero Banner', icon: FiImage, group: 'Appearance' },
  { to: '/admin/cms', label: 'CMS Pages', icon: FiFileText, group: 'Content' },
  { to: '/admin/blogs', label: 'Blogs', icon: FiBookOpen, group: 'Content' },
  { to: '/admin/contact-messages', label: 'Contact Messages', icon: FiMail, group: 'Content' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cms, activePalette } = useCMS()
  const [mode, setMode] = useState(() => localStorage.getItem('admin_mode') || 'light')
  const [toasts, setToasts] = useState([])
  const [showEntryTransition, setShowEntryTransition] = useState(true)
  const [unseenBookings, setUnseenBookings] = useState(0)
  const latestKnownBookingIdRef = useRef(0)
  const audioCtxRef = useRef(null)
  const brandName = cms.site_name || 'Admin'
  const logo = cms.logo_url || ''
  const adminTitle = `${brandName} Admin`
  const SEEN_KEY = 'admin_seen_booking_id'

  const getSeenBookingId = () => {
    const raw = Number(localStorage.getItem(SEEN_KEY) || 0)
    return Number.isFinite(raw) ? raw : 0
  }

  const setSeenBookingId = (id) => {
    const safe = Number(id || 0)
    localStorage.setItem(SEEN_KEY, String(safe > 0 ? safe : 0))
  }

  useEffect(() => {
    localStorage.setItem('admin_mode', mode)
  }, [mode])

  useEffect(() => {
    const eventName = getAdminToastEventName()
    const handler = (e) => {
      const toast = e?.detail
      if (!toast?.message) return
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 2800)
    }
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [])

  useEffect(() => {
    let cancelled = false

    const getAudioContext = async () => {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
      if (audioCtxRef.current.state === 'suspended') {
        try {
          await audioCtxRef.current.resume()
        } catch {
          /* ignore */
        }
      }
      return audioCtxRef.current
    }

    const playTing = async () => {
      try {
        const ctx = await getAudioContext()
        if (!ctx) return
        const master = ctx.createGain()
        master.gain.value = 0.24
        master.connect(ctx.destination)
        const now = ctx.currentTime + 0.01
        const notes = [
          { f: 784, t: now, d: 0.12 },      // G5
          { f: 988, t: now + 0.13, d: 0.13 }, // B5
          { f: 1174, t: now + 0.27, d: 0.16 }, // D6
          { f: 1568, t: now + 0.45, d: 0.2 }, // G6
        ]
        notes.forEach(({ f, t, d }) => {
          const lead = ctx.createOscillator()
          const leadGain = ctx.createGain()
          lead.type = 'sine'
          lead.frequency.setValueAtTime(f, t)
          leadGain.gain.setValueAtTime(0.0001, t)
          leadGain.gain.exponentialRampToValueAtTime(0.48, t + 0.012)
          leadGain.gain.exponentialRampToValueAtTime(0.0001, t + d)
          lead.connect(leadGain)
          leadGain.connect(master)
          lead.start(t)
          lead.stop(t + d + 0.01)

          const harmonic = ctx.createOscillator()
          const harmonicGain = ctx.createGain()
          harmonic.type = 'triangle'
          harmonic.frequency.setValueAtTime(f * 2, t)
          harmonicGain.gain.setValueAtTime(0.0001, t)
          harmonicGain.gain.exponentialRampToValueAtTime(0.16, t + 0.01)
          harmonicGain.gain.exponentialRampToValueAtTime(0.0001, t + d * 0.9)
          harmonic.connect(harmonicGain)
          harmonicGain.connect(master)
          harmonic.start(t)
          harmonic.stop(t + d)
        })
      } catch {
        /* ignore */
      }
    }

    const pushBookingToast = (message) => {
      const toast = {
        id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        tone: 'success',
        message,
      }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3200)
    }

    const checkBookings = async () => {
      if (document.hidden) return
      try {
        const { data } = await client.get('/api/admin/bookings')
        if (cancelled || !Array.isArray(data) || !data.length) return
        const latestId = Number(data[0]?.id || 0)
        if (!latestId) return
        const seenId = getSeenBookingId()
        const unseenCountNow = data.filter((b) => Number(b.id) > seenId).length
        setUnseenBookings(unseenCountNow)

        if (latestKnownBookingIdRef.current === 0) {
          latestKnownBookingIdRef.current = latestId
          if (unseenCountNow > 0) {
            playTing()
            pushBookingToast(
              unseenCountNow > 1
                ? `${unseenCountNow} unseen bookings found`
                : '1 unseen booking found',
            )
          }
          return
        }

        if (latestId > latestKnownBookingIdRef.current) {
          const newCount = data.filter((b) => Number(b.id) > latestKnownBookingIdRef.current).length
          latestKnownBookingIdRef.current = latestId
          playTing()
          pushBookingToast(
            newCount > 1 ? `${newCount} new bookings received` : 'New booking received',
          )
        }
      } catch {
        /* ignore polling errors */
      }
    }

    checkBookings()
    const interval = window.setInterval(checkBookings, 60000)
    const unlockAudio = () => {
      getAudioContext()
    }
    window.addEventListener('pointerdown', unlockAudio, { passive: true })
    window.addEventListener('keydown', unlockAudio)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  useEffect(() => {
    if (!location.pathname.startsWith('/admin/bookings')) return
    let active = true
    client.get('/api/admin/bookings').then(({ data }) => {
      if (!active || !Array.isArray(data) || !data.length) return
      const latestId = Number(data[0]?.id || 0)
      if (latestId > 0) {
        setSeenBookingId(latestId)
        setUnseenBookings(0)
        if (latestId > latestKnownBookingIdRef.current) {
          latestKnownBookingIdRef.current = latestId
        }
      }
    }).catch(() => {})
    return () => {
      active = false
    }
  }, [location.pathname])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowEntryTransition(false), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const logout = async () => {
    try {
      await client.post('/api/admin/logout')
    } catch {
      /* ignore */
    }
    navigate('/admin/login')
  }

  let lastGroup = ''

  const adminShellStyle = useMemo(
    () => getAdminThemeCssVars(activePalette, cms, mode === 'light' ? 'light' : 'dark'),
    [activePalette, cms, mode],
  )

  return (
    <div
      className={`admin-shell ${mode === 'light' ? 'admin-light' : 'admin-dark'}`}
      style={adminShellStyle}
    >
      <aside className="admin-sidebar">
        <div className="admin-brand">
          {logo ? (
            <img src={logo} alt="" className="admin-brand-logo" />
          ) : (
            <span className="admin-logo-dot" />
          )}
          <span className="admin-brand-text">{brandName}</span>
        </div>
        <nav className="admin-nav">
          {nav.map((item) => {
            const showGroup = item.group !== lastGroup
            lastGroup = item.group
            return (
              <div key={item.to}>
                {showGroup && (
                  <div className="admin-nav-group">{item.group}</div>
                )}
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="admin-nav-link-icon" aria-hidden />
                  <span>{item.label}</span>
                  {item.to === '/admin/bookings' && unseenBookings > 0 && (
                    <span className="admin-nav-badge">{unseenBookings > 99 ? '99+' : unseenBookings}</span>
                  )}
                </NavLink>
              </div>
            )
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" className="admin-logout" onClick={logout}>
            <FiLogOut aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">{adminTitle}</h1>
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="admin-mode-btn"
              onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
              aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
            >
              {mode === 'light' ? <FiMoon aria-hidden /> : <FiSun aria-hidden />}
            </button>
            <a href="/" target="_blank" rel="noreferrer" className="admin-view-site">
              <FiExternalLink aria-hidden />
              <span>View Site</span>
            </a>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
      {toasts.length > 0 && (
        <div className="admin-toast-stack">
          {toasts.map((t) => (
            <div key={t.id} className={`admin-toast ${t.tone === 'error' ? 'error' : 'success'}`}>
              {t.message}
            </div>
          ))}
        </div>
      )}
      <PageTransitionOverlay
        active={showEntryTransition}
        logoUrl={logo}
        brandName={brandName}
        tone={mode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  )
}
