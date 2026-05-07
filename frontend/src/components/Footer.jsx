import { Link } from 'react-router-dom'
import { useCMS } from '../context/CMSContext'
import './Footer.css'

export default function Footer() {
  const { cms } = useCMS()
  const siteName = cms.site_name || 'ServiceBook'
  const brand = cms.footer_brand_text || 'Professional services delivered with care.'
  const copyright = cms.footer_copyright || 'All rights reserved.'
  const powered = cms.footer_powered || ''

  let social = []
  try {
    social = JSON.parse(cms.social_links || '[]')
  } catch {
    social = []
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="footer-brand hero-font">{siteName}</div>
          <p className="footer-desc">{brand}</p>
          {social.length > 0 && (
            <div className="footer-social">
              {social.map((s, i) => (
                <a key={i} href={s.url || '#'} target="_blank" rel="noreferrer">
                  {s.label || 'Link'}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="footer-col">
          <div className="footer-heading">Quick Links</div>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Policies</div>
          <Link to="/policies/privacy">Privacy Policy</Link>
          <Link to="/policies/terms">Terms of Service</Link>
          <Link to="/policies/refund">Refund Policy</Link>
        </div>
        <div className="footer-col">
          <div className="footer-heading">Contact</div>
          <p>{cms.contact_email}</p>
          <p>{cms.contact_phone}</p>
          <p>{cms.contact_address}</p>
        </div>
      </div>
      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <span>© {new Date().getFullYear()} {siteName}. {copyright}</span>
          {powered && <span>{powered}</span>}
        </div>
      </div>
    </footer>
  )
}
