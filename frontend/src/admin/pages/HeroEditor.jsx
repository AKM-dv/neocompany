import { useEffect, useState } from 'react'
import { useCMS } from '../../context/CMSContext'
import client from '../../api/client'
import '../AdminLayout.css'

const blankBanner = {
  image_url: '',
  link: '/services',
  badge: '',
  title: '',
  subtitle: '',
  button_text: '',
  show_accent_overlay: true,
}

export default function HeroEditor() {
  const { cms, refresh } = useCMS()
  const [form, setForm] = useState({
    hero_image: '',
    hero_headline: '',
    hero_subheadline: '',
    hero_cta_text: '',
    hero_cta_link: '',
    hero_badge: '',
    hero_banners: [],
  })
  const [uploading, setUploading] = useState(false)
  const [bannerUploadingIdx, setBannerUploadingIdx] = useState(null)

  useEffect(() => {
    let parsedBanners = []
    try {
      const arr = JSON.parse(cms.hero_banners || '[]')
      parsedBanners = Array.isArray(arr)
        ? arr.slice(0, 5).map((b) => ({
            ...blankBanner,
            ...(b || {}),
            show_accent_overlay: b?.show_accent_overlay !== false,
          }))
        : []
    } catch {
      parsedBanners = []
    }
    if (!parsedBanners.length && cms.hero_image) {
      parsedBanners = [
        {
          ...blankBanner,
          image_url: cms.hero_image,
          link: cms.hero_cta_link || '/services',
          badge: cms.hero_badge || '',
          title: cms.hero_headline || '',
          subtitle: cms.hero_subheadline || '',
          button_text: cms.hero_cta_text || '',
        },
      ]
    }
    setForm((f) => ({
      ...f,
      hero_image: cms.hero_image || '',
      hero_headline: cms.hero_headline || '',
      hero_subheadline: cms.hero_subheadline || '',
      hero_cta_text: cms.hero_cta_text || '',
      hero_cta_link: cms.hero_cta_link || '',
      hero_badge: cms.hero_badge || '',
      hero_banners: parsedBanners,
    }))
  }, [cms])

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', body)
      setForm((f) => ({ ...f, hero_image: data.url }))
    } finally {
      setUploading(false)
    }
  }

  const onBannerFile = async (idx, file) => {
    if (!file) return
    setBannerUploadingIdx(idx)
    try {
      const body = new FormData()
      body.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', body)
      setForm((prev) => {
        const next = [...(prev.hero_banners || [])]
        next[idx] = { ...(next[idx] || blankBanner), image_url: data.url }
        return { ...prev, hero_banners: next }
      })
    } finally {
      setBannerUploadingIdx(null)
    }
  }

  const addBanner = () => {
    setForm((prev) => {
      const curr = prev.hero_banners || []
      if (curr.length >= 5) return prev
      return { ...prev, hero_banners: [...curr, { ...blankBanner }] }
    })
  }

  const removeBanner = (idx) => {
    setForm((prev) => ({
      ...prev,
      hero_banners: (prev.hero_banners || []).filter((_, i) => i !== idx),
    }))
  }

  const save = async () => {
    const cleanedBanners = (form.hero_banners || [])
      .slice(0, 5)
      .map((b) => ({
        image_url: (b.image_url || '').trim(),
        link: (b.link || '').trim(),
        badge: (b.badge || '').trim(),
        title: (b.title || '').trim(),
        subtitle: (b.subtitle || '').trim(),
        button_text: (b.button_text || '').trim(),
        show_accent_overlay: b.show_accent_overlay !== false,
      }))
      .filter((b) => b.image_url)
    await client.put('/api/admin/cms', {
      hero_image: form.hero_image,
      hero_headline: form.hero_headline,
      hero_subheadline: form.hero_subheadline,
      hero_cta_text: form.hero_cta_text,
      hero_cta_link: form.hero_cta_link,
      hero_badge: form.hero_badge,
      hero_banners: JSON.stringify(cleanedBanners),
    })
    refresh()
  }

  return (
    <div>
      <div
        className="admin-card"
        style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}
      >
        <div
          style={{
            height: 280,
            background: form.hero_image
              ? `url(${form.hero_image}) center/cover`
              : 'linear-gradient(135deg, #1a1a2e, #e8622a)',
          }}
        />
      </div>
      <div className="admin-card">
        <h2 style={{ marginTop: 0 }}>Hero settings</h2>
        <div className="admin-field">
          <label>Hero Banner Slides (max 5)</label>
          <div style={{ display: 'grid', gap: 10 }}>
            {(form.hero_banners || []).map((b, idx) => (
              <div key={idx} style={{ border: '1px solid var(--admin-border)', borderRadius: 8, padding: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="file" accept="image/*" onChange={(e) => onBannerFile(idx, e.target.files?.[0])} disabled={bannerUploadingIdx === idx} />
                  <div style={{ minHeight: 38, display: 'flex', alignItems: 'center' }}>
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt=""
                        style={{ width: 72, height: 38, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--admin-border)' }}
                      />
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--admin-muted)' }}>No image uploaded</span>
                    )}
                  </div>
                  <input
                    className="admin-input"
                    placeholder="Banner click link (e.g. /services)"
                    value={b.link || ''}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...(prev.hero_banners || [])]
                        next[idx] = { ...(next[idx] || blankBanner), link: e.target.value }
                        return { ...prev, hero_banners: next }
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Optional badge text"
                    value={b.badge || ''}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...(prev.hero_banners || [])]
                        next[idx] = { ...(next[idx] || blankBanner), badge: e.target.value }
                        return { ...prev, hero_banners: next }
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Optional title override"
                    value={b.title || ''}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...(prev.hero_banners || [])]
                        next[idx] = { ...(next[idx] || blankBanner), title: e.target.value }
                        return { ...prev, hero_banners: next }
                      })
                    }
                  />
                  <input
                    className="admin-input"
                    placeholder="Optional subtitle override"
                    value={b.subtitle || ''}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...(prev.hero_banners || [])]
                        next[idx] = { ...(next[idx] || blankBanner), subtitle: e.target.value }
                        return { ...prev, hero_banners: next }
                      })
                    }
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <input
                    className="admin-input"
                    style={{ width: '70%' }}
                    placeholder="Optional button text override"
                    value={b.button_text || ''}
                    onChange={(e) =>
                      setForm((prev) => {
                        const next = [...(prev.hero_banners || [])]
                        next[idx] = { ...(next[idx] || blankBanner), button_text: e.target.value }
                        return { ...prev, hero_banners: next }
                      })
                    }
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="admin-toggle-row">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={b.show_accent_overlay !== false}
                        aria-label={`Accent overlay ${b.show_accent_overlay !== false ? 'on' : 'off'}`}
                        className={`admin-toggle ${b.show_accent_overlay !== false ? 'on' : ''}`}
                        onClick={() =>
                          setForm((prev) => {
                            const next = [...(prev.hero_banners || [])]
                            next[idx] = {
                              ...(next[idx] || blankBanner),
                              show_accent_overlay: !(next[idx]?.show_accent_overlay !== false),
                            }
                            return { ...prev, hero_banners: next }
                          })
                        }
                      />
                      <span>Accent</span>
                    </div>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => removeBanner(idx)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(form.hero_banners || []).length < 5 && (
            <button type="button" className="admin-btn admin-btn-ghost" style={{ marginTop: 8 }} onClick={addBanner}>
              Add Banner Slide
            </button>
          )}
        </div>

        <div className="admin-field">
          <label>Hero image</label>
          <input type="file" accept="image/*" onChange={onFile} disabled={uploading} />
          {form.hero_image ? (
            <div style={{ marginTop: 8 }}>
              <img
                src={form.hero_image}
                alt=""
                style={{ width: 120, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--admin-border)' }}
              />
            </div>
          ) : null}
        </div>
        <div className="admin-field">
          <label>Headline</label>
          <input
            className="admin-input"
            value={form.hero_headline}
            onChange={(e) => setForm({ ...form, hero_headline: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>Subheadline</label>
          <input
            className="admin-input"
            value={form.hero_subheadline}
            onChange={(e) => setForm({ ...form, hero_subheadline: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>Badge</label>
          <input
            className="admin-input"
            value={form.hero_badge}
            onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>CTA text</label>
          <input
            className="admin-input"
            value={form.hero_cta_text}
            onChange={(e) => setForm({ ...form, hero_cta_text: e.target.value })}
          />
        </div>
        <div className="admin-field">
          <label>CTA link</label>
          <input
            className="admin-input"
            value={form.hero_cta_link}
            onChange={(e) => setForm({ ...form, hero_cta_link: e.target.value })}
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  )
}
