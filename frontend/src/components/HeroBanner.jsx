import { useEffect, useMemo, useState } from 'react'
import { useCMS } from '../context/CMSContext'
import './HeroBanner.css'

export default function HeroBanner({ compact = false }) {
  const { cms } = useCMS()
  const [idx, setIdx] = useState(0)
  const img = cms.hero_image
  const headline = cms.hero_headline || 'Premium care for your home & life'
  const sub = cms.hero_subheadline || ''
  const cta = cms.hero_cta_text || 'Explore Services'
  const ctaLink = cms.hero_cta_link || '/services'
  const badge = cms.hero_badge || ''
  const banners = useMemo(() => {
    try {
      const parsed = JSON.parse(cms.hero_banners || '[]')
      if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, 5)
    } catch {
      /* ignore */
    }
    if (img) {
      return [
        {
          image_url: img,
          link: ctaLink,
          badge,
          title: headline,
          subtitle: sub,
          button_text: cta,
        },
      ]
    }
    return []
  }, [cms.hero_banners, img, ctaLink, badge, headline, sub, cta])

  useEffect(() => {
    setIdx(0)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % banners.length)
    }, 3200)
    return () => clearInterval(t)
  }, [banners.length])

  const active = banners[idx] || {}
  const slideImg = active.image_url || img
  const showAccentOverlay = active.show_accent_overlay !== false

  return (
    <section className={`hero-section ${compact ? 'hero-compact' : ''}`}>
      <div
        className="hero-bg"
        style={
          slideImg
            ? { backgroundImage: `url(${slideImg})` }
            : { backgroundImage: 'linear-gradient(135deg, var(--primary), var(--secondary))' }
        }
      >
        {showAccentOverlay && <div className="hero-gradient" />}
        <div className="container hero-content fade-up">
        </div>
        {banners.length > 1 && (
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-dot ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Show banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
