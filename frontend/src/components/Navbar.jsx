import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCMS } from '../context/CMSContext'
import { useCart } from '../context/CartContext'
import { FiHome, FiGrid, FiInfo, FiMail, FiBookOpen } from 'react-icons/fi'
import './Navbar.css'

export default function Navbar({ onOpenCart }) {
  const { cms } = useCMS()
  const { totalQty } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setBump(true)
    const t = setTimeout(() => setBump(false), 400)
    return () => clearTimeout(t)
  }, [totalQty])

  const siteName = cms.site_name || 'ServiceBook'
  const logo = cms.logo_url

  const linkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : ''}`

  return (
    <header className={`site-nav ${scrolled ? 'site-nav-scrolled' : ''}`}>
      <div className="container site-nav-inner">
        <Link to="/" className="site-brand" onClick={() => setMobileOpen(false)}>
          {logo ? (
            <img src={logo} alt="" className="site-logo-img" />
          ) : (
            <span className="site-logo-mark" aria-hidden />
          )}
          <span className="site-name hero-font">{siteName}</span>
        </Link>

        <nav className={`site-nav-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
            <FiHome className="nav-link-icon" aria-hidden />
            Home
          </NavLink>
          <NavLink to="/services" className={linkClass} onClick={() => setMobileOpen(false)}>
            <FiGrid className="nav-link-icon" aria-hidden />
            Services
          </NavLink>
          <NavLink to="/about" className={linkClass} onClick={() => setMobileOpen(false)}>
            <FiInfo className="nav-link-icon" aria-hidden />
            About Us
          </NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setMobileOpen(false)}>
            <FiMail className="nav-link-icon" aria-hidden />
            Contact Us
          </NavLink>
          <NavLink to="/blog" className={linkClass} onClick={() => setMobileOpen(false)}>
            <FiBookOpen className="nav-link-icon" aria-hidden />
            Blog
          </NavLink>
        </nav>

        <div className="site-nav-actions">
          <button
            type="button"
            className={`cart-btn ${bump ? 'cart-bump' : ''}`}
            aria-label="Open cart"
            onClick={onOpenCart}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 7h15l-1.5 9h-12L6 7Zm0 0L5 3H2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="19" r="1.6" fill="currentColor" />
              <circle cx="17.5" cy="19" r="1.6" fill="currentColor" />
            </svg>
            {totalQty > 0 && (
              <span className="cart-badge">{totalQty > 99 ? '99+' : totalQty}</span>
            )}
          </button>

          <button
            type="button"
            className="nav-hamburger"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </header>
  )
}
