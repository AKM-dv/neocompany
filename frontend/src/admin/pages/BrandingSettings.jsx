import { useEffect, useState } from 'react'
import client from '../../api/client'
import { notifyAdminToast } from '../adminToast'
import { useCMS } from '../../context/CMSContext'
import '../AdminLayout.css'

export default function BrandingSettings() {
  const currencyOptions = [
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AED', label: 'AED - UAE Dirham' },
  ]
  const { cms, refresh } = useCMS()
  const [form, setForm] = useState({
    logo_url: '',
    favicon_url: '',
    og_image_url: '',
    site_name: '',
    site_tagline: '',
    browser_title: '',
    og_title: '',
    brand_description: '',
    company_gst: '',
    currency_code: 'INR',
    whatsapp_enabled: false,
    whatsapp_number: '',
    booking_hour_start: '6',
    booking_hour_end: '23',
  })
  const [uploading, setUploading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [uploadingOgImage, setUploadingOgImage] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      logo_url: cms.logo_url || '',
      favicon_url: cms.favicon_url || '',
      og_image_url: cms.og_image_url || '',
      site_name: cms.site_name || '',
      site_tagline: cms.site_tagline || '',
      browser_title: cms.browser_title || '',
      og_title: cms.og_title || '',
      brand_description: cms.brand_description || '',
      company_gst: cms.company_gst || '',
      currency_code: (cms.currency_code || 'INR').toUpperCase(),
      whatsapp_enabled: String(cms.whatsapp_enabled || '').toLowerCase() === 'true',
      whatsapp_number: cms.whatsapp_number || '',
      booking_hour_start: String(
        cms.booking_hour_start !== undefined && cms.booking_hour_start !== ''
          ? cms.booking_hour_start
          : '6',
      ),
      booking_hour_end: String(
        cms.booking_hour_end !== undefined && cms.booking_hour_end !== ''
          ? cms.booking_hour_end
          : '23',
      ),
    })
  }, [cms])

  const uploadLogo = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', fd)
      setForm((f) => ({ ...f, logo_url: data.url || '' }))
    } finally {
      setUploading(false)
    }
  }

  const uploadFavicon = async (file) => {
    if (!file) return
    setUploadingFavicon(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', fd)
      setForm((f) => ({ ...f, favicon_url: data.url || '' }))
    } finally {
      setUploadingFavicon(false)
    }
  }

  const uploadOgImage = async (file) => {
    if (!file) return
    setUploadingOgImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', fd)
      setForm((f) => ({ ...f, og_image_url: data.url || '' }))
    } finally {
      setUploadingOgImage(false)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await client.put('/api/admin/cms', {
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
        og_image_url: form.og_image_url,
        site_name: form.site_name,
        site_tagline: form.site_tagline.trim(),
        browser_title: form.browser_title.trim(),
        og_title: form.og_title.trim(),
        brand_description: form.brand_description,
        company_gst: form.company_gst,
        currency_code: (form.currency_code || 'INR').toUpperCase(),
        whatsapp_enabled: form.whatsapp_enabled ? 'true' : 'false',
        whatsapp_number: form.whatsapp_number.trim(),
        booking_hour_start: String(
          Math.max(0, Math.min(23, parseInt(form.booking_hour_start, 10) || 6)),
        ),
        booking_hour_end: String(
          Math.max(0, Math.min(23, parseInt(form.booking_hour_end, 10) || 23)),
        ),
      })
      await refresh()
      notifyAdminToast('Branding settings saved', 'success')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
      <form className="admin-card" onSubmit={save}>
        <h2 style={{ marginTop: 0 }}>Branding Management</h2>

        <div className="admin-field">
          <label>Logo Upload</label>
          <input type="file" accept="image/*" onChange={(e) => uploadLogo(e.target.files?.[0])} disabled={uploading} />
          {uploading && <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>Uploading logo...</div>}
        </div>

        <div className="admin-field">
          <label>Favicon (square PNG / ICO / SVG recommended)</label>
          <input
            type="file"
            accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico,.svg"
            onChange={(e) => uploadFavicon(e.target.files?.[0])}
            disabled={uploadingFavicon}
          />
          {uploadingFavicon && (
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>Uploading favicon...</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>
            Used for browser tab icon; falls back to logo if unset.
          </div>
        </div>

        <div className="admin-field">
          <label>Social preview image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => uploadOgImage(e.target.files?.[0])} disabled={uploadingOgImage} />
          {uploadingOgImage && (
            <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>Uploading image...</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>
            Open Graph / Twitter card image. Defaults to logo if empty.
          </div>
        </div>

        <div className="admin-field">
          <label>Brand Name</label>
          <input className="admin-input" value={form.site_name} onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))} placeholder="Your company / brand name" />
        </div>

        <div className="admin-field">
          <label>Tagline (short)</label>
          <input
            className="admin-input"
            value={form.site_tagline}
            onChange={(e) => setForm((f) => ({ ...f, site_tagline: e.target.value }))}
            placeholder="Shown in browser tab after the brand name"
          />
        </div>

        <div className="admin-field">
          <label>Browser tab title override (optional)</label>
          <input
            className="admin-input"
            value={form.browser_title}
            onChange={(e) => setForm((f) => ({ ...f, browser_title: e.target.value }))}
            placeholder="Leave blank to use “Brand · Tagline”"
          />
        </div>

        <div className="admin-field">
          <label>Social share title (Open Graph / Twitter)</label>
          <input
            className="admin-input"
            value={form.og_title}
            onChange={(e) => setForm((f) => ({ ...f, og_title: e.target.value }))}
            placeholder="Leave blank to use brand name only"
          />
        </div>

        <div className="admin-field">
          <label>Brand Description</label>
          <textarea className="admin-input" rows={4} value={form.brand_description} onChange={(e) => setForm((f) => ({ ...f, brand_description: e.target.value }))} placeholder="Meta description and social preview text" />
        </div>

        <div className="admin-field">
          <label>Company GST Registration (optional)</label>
          <input className="admin-input" value={form.company_gst} onChange={(e) => setForm((f) => ({ ...f, company_gst: e.target.value }))} placeholder="GSTIN / registration detail if available" />
        </div>

        <div className="admin-field">
          <label>Default Currency</label>
          <select
            className="admin-input"
            value={form.currency_code}
            onChange={(e) => setForm((f) => ({ ...f, currency_code: e.target.value }))}
          >
            {currencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>
            This will be the default currency for the platform. Default is INR.
          </div>
        </div>

        <div className="admin-field">
          <label>Floating WhatsApp Button</label>
          <div className="admin-toggle-row" style={{ marginBottom: 8 }}>
            <button
              type="button"
              role="switch"
              aria-checked={!!form.whatsapp_enabled}
              aria-label={`Set whatsapp button ${form.whatsapp_enabled ? 'off' : 'on'}`}
              className={`admin-toggle ${form.whatsapp_enabled ? 'on' : ''}`}
              onClick={() => setForm((f) => ({ ...f, whatsapp_enabled: !f.whatsapp_enabled }))}
            />
            <span>{form.whatsapp_enabled ? 'On' : 'Off'}</span>
          </div>
          <input
            className="admin-input"
            placeholder="WhatsApp number with country code (e.g. 919876543210)"
            value={form.whatsapp_number}
            onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
          />
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>
            Shown only when enabled. Clicking opens WhatsApp chat.
          </div>
        </div>

        <div className="admin-field">
          <label>Checkout booking hours (public site)</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--admin-muted)' }}>First slot</span>
            <input
              type="number"
              min={0}
              max={23}
              className="admin-input"
              style={{ maxWidth: 88 }}
              value={form.booking_hour_start}
              onChange={(e) => setForm((f) => ({ ...f, booking_hour_start: e.target.value }))}
              aria-label="First bookable hour 0 to 23"
            />
            <span style={{ fontSize: 13, color: 'var(--admin-muted)' }}>through last slot</span>
            <input
              type="number"
              min={0}
              max={23}
              className="admin-input"
              style={{ maxWidth: 88 }}
              value={form.booking_hour_end}
              onChange={(e) => setForm((f) => ({ ...f, booking_hour_end: e.target.value }))}
              aria-label="Last bookable hour 0 to 23"
            />
            <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>(24-hour clock, hourly)</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 6 }}>
            Default is 6 → 23 (6:00 AM–11:00 PM). Customers can book any number of appointments; times outside this
            window are rejected. Change anytime.
          </div>
        </div>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Branding'}
        </button>
      </form>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Preview</h3>
        <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 10 }}>
            Tab title:{' '}
            <strong style={{ color: 'var(--admin-text)' }}>
              {form.browser_title ||
                (form.site_name || 'Brand') + (form.site_tagline ? ` · ${form.site_tagline}` : '')}
            </strong>
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-muted)', marginBottom: 12 }}>
            og:title:{' '}
            <strong style={{ color: 'var(--admin-text)' }}>{form.og_title || form.site_name || 'Brand'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {form.logo_url ? (
              <img src={form.logo_url} alt="" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--admin-border)', background: '#fff' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--admin-surface-2)', border: '1px solid var(--admin-border)' }} />
            )}
            {form.favicon_url ? (
              <img src={form.favicon_url} alt="" title="Favicon" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--admin-border)', background: '#fff' }} />
            ) : null}
            <div>
              <div style={{ fontWeight: 700 }}>{form.site_name || 'Brand Name'}</div>
              <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{form.company_gst ? `GST: ${form.company_gst}` : 'GST not provided'}</div>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--admin-muted)' }}>
            {form.brand_description || 'Brand description will appear here as supporting copy.'}
          </p>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--admin-muted)' }}>
            Default Currency: <strong>{form.currency_code || 'INR'}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--admin-muted)' }}>
            WhatsApp Float: <strong>{form.whatsapp_enabled ? 'Enabled' : 'Disabled'}</strong>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--admin-muted)' }}>
            Checkout hours:{' '}
            <strong>
              {Math.max(0, Math.min(23, parseInt(form.booking_hour_start, 10) || 6))}:00–
              {Math.max(0, Math.min(23, parseInt(form.booking_hour_end, 10) || 23))}:00
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}
