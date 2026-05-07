import { useState } from 'react'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import HeroBanner from '../../components/HeroBanner'
import './StaticPage.css'
import './ContactUs.css'

export default function ContactUs() {
  const { cms } = useCMS()
  const html = cms.contact_html || ''
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await client.post('/api/contact', {
        ...form,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
      })
      setSent(true)
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Failed to send')
    }
  }

  return (
    <>
      <HeroBanner compact />
      <div className="container contact-layout">
        <div className="contact-left cms-content" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="contact-right">
          {sent ? (
            <div className="contact-success">
              <div className="success-check">✓</div>
              <h2 className="hero-font">Thank you</h2>
              <p>Your message has been sent.</p>
            </div>
          ) : (
            <form className="contact-card" onSubmit={submit}>
              <h2 className="hero-font contact-form-title">Send a message</h2>
              <div className="field">
                <label htmlFor="cname">Name</label>
                <input
                  id="cname"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="cemail">Email</label>
                <input
                  id="cemail"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="csub">Subject</label>
                <input
                  id="csub"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="cmsg">Message</label>
                <textarea
                  id="cmsg"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              {err && <p className="field-error">{err}</p>}
              <button type="submit" className="contact-send">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
      <div className="container contact-meta-grid">
        <div>
          <strong>Phone</strong>
          <p>{cms.contact_phone}</p>
        </div>
        <div>
          <strong>Email</strong>
          <p>{cms.contact_email}</p>
        </div>
        <div>
          <strong>Address</strong>
          <p>{cms.contact_address}</p>
        </div>
        <div>
          <strong>Hours</strong>
          <p>{cms.contact_hours}</p>
        </div>
      </div>
      {cms.contact_map_embed && (
        <div className="container map-wrap">
          <div
            className="map-embed cms-content"
            dangerouslySetInnerHTML={{ __html: cms.contact_map_embed }}
          />
        </div>
      )}
    </>
  )
}
