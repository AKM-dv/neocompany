import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCMS } from '../../context/CMSContext'
import HeroBanner from '../../components/HeroBanner'
import './Policies.css'

const MAP = {
  privacy: 'privacy_html',
  terms: 'terms_html',
  refund: 'refund_html',
}

const TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  refund: 'Refund Policy',
}

export default function Policies() {
  const { slug } = useParams()
  const { cms } = useCMS()
  const safeSlug = MAP[slug] ? slug : 'privacy'
  const key = MAP[safeSlug] || 'privacy_html'
  const html = cms[key] || '<p>Content coming soon.</p>'
  const title = TITLES[safeSlug] || 'Policy'

  const headings = useMemo(() => parseHeadings(html), [html])
  const [active, setActive] = useState('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 },
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [headings])

  return (
    <>
      <HeroBanner compact />
      <div className="container policies-layout">
        <aside className="policies-toc">
          <div className="toc-title">On this page</div>
          <ul>
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={active === h.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
        <div className="policies-main">
          <h1 className="policies-h1 hero-font">{title}</h1>
          <div
            className="cms-content policies-body"
            dangerouslySetInnerHTML={{ __html: injectIds(html) }}
          />
        </div>
      </div>
    </>
  )
}

function parseHeadings(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const out = []
  doc.querySelectorAll('h2, h3').forEach((el, i) => {
    const text = el.textContent?.trim() || `Section ${i + 1}`
    const id = `sec-${i}-${text.slice(0, 12).replace(/\s+/g, '-').toLowerCase()}`
    out.push({ id, text })
  })
  return out
}

function injectIds(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('h2, h3').forEach((el, i) => {
    const text = el.textContent?.trim() || `Section ${i + 1}`
    const id = `sec-${i}-${text.slice(0, 12).replace(/\s+/g, '-').toLowerCase()}`
    el.id = id
  })
  return doc.body.innerHTML
}
