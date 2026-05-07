import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiCopy,
  FiArrowUpRight,
  FiFacebook,
  FiLinkedin,
  FiMessageCircle,
  FiTwitter,
  FiUser,
} from 'react-icons/fi'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import './Blog.css'

export default function BlogDetail() {
  const { cms, reapplyBrandingHead } = useCMS()
  const navigate = useNavigate()
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    client.get(`/api/blogs/${slug}`).then((r) => setBlog(r.data)).catch(() => setBlog(null))
  }, [slug])

  useEffect(() => {
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (total <= 0) return setProgress(0)
      setProgress(Math.min(100, Math.round((window.scrollY / total) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!blog) return
    const brand = (cms.site_name || '').trim() || 'Blog'
    document.title = `${blog.title} | ${brand}`
    upsertMeta('description', blog.meta_description || blog.excerpt || '')
    upsertMeta('og:title', blog.title, true)
    upsertMeta('og:description', blog.meta_description || blog.excerpt || '', true)
    upsertMeta('og:image', blog.featured_image_url || '', true)
    return () => reapplyBrandingHead()
  }, [blog, cms.site_name, reapplyBrandingHead])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(blog?.title || '')
  const social = useMemo(
    () => [
      { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: FiMessageCircle },
      { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: FiFacebook },
      { id: 'twitter', label: 'X', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: FiTwitter },
      { id: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: FiLinkedin },
    ],
    [encodedTitle, encodedUrl],
  )

  if (!blog) {
    return (
      <div className="container page-pad">
        <p>Loading or not found.</p>
      </div>
    )
  }

  return (
    <article className="blog-article-wrap blog-article-page">
      <div className="blog-progress" style={{ width: `${progress}%` }} />
      <div className="blog-article-sheet container page-pad">
        <header className="blog-hero">
          <div className="blog-hero-head">
            <span className="blog-chip">{blog.category || 'General'}</span>
            <h1 className="hero-font">{blog.title}</h1>
            <div className="blog-meta">
              <span><FiUser /> {blog.author_name || 'Admin'}</span>
              <span><FiCalendar /> {formatDate(blog.published_at)}</span>
              <span><FiClock /> {blog.read_time_minutes || 5} min read</span>
              <span>Updated: {formatDate(blog.updated_at)}</span>
            </div>
          </div>
          <img src={blog.featured_image_url || 'https://placehold.co/1400x640'} alt="" className="blog-hero-img" />
        </header>

        <div className="blog-article-grid">
          <aside className="blog-share-sticky">
            {social.map((s) => (
              <a key={s.id} href={s.href} target="_blank" rel="noreferrer" className="blog-share-btn" title={s.label} aria-label={s.label}>
                {s.icon ? <s.icon /> : null}
              </a>
            ))}
            <button
              type="button"
              className="blog-share-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl)
              }}
              title="Copy Link"
            >
              <FiCopy />
            </button>
          </aside>

          <section className="blog-content cms-content">
            <div dangerouslySetInnerHTML={{ __html: blog.content || '' }} />
            <div className="blog-inline-cta">
              <h3 className="hero-font">Need this as a service?</h3>
              <p>Book our experts instantly and get confirmed quickly.</p>
              <Link to="/services" className="blog-read-btn">Explore Services</Link>
            </div>
          </section>
        </div>
      </div>

      {blog.related?.length > 0 && (
        <section className="container page-pad">
          <h2 className="hero-font">Related Articles</h2>
          <div className="blog-grid">
            {blog.related.map((r) => (
              <article
                key={r.id}
                className="blog-card"
                onClick={() => navigate(`/blog/${r.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/blog/${r.slug}`)}
              >
                <img src={r.featured_image_url || 'https://placehold.co/800x520'} alt="" />
                <div className="blog-card-body">
                  <div className="blog-card-top">
                    <span className="blog-chip subtle">{r.category || 'General'}</span>
                    <span className="blog-card-arrow">
                      <FiArrowUpRight />
                    </span>
                  </div>
                  <h3 className="hero-font">{r.title}</h3>
                  <p>{r.excerpt || ''}</p>
                  <div className="blog-card-footer">
                    <div className="blog-author">
                      <span className="blog-author-avatar">{getInitials(r.author_name)}</span>
                      <span className="blog-author-name">{r.author_name || 'Admin'}</span>
                    </div>
                    <span className="blog-date">{formatDateShort(r.published_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function upsertMeta(name, content, isProperty = false) {
  const sel = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`
  let el = document.head.querySelector(sel)
  if (!el) {
    el = document.createElement('meta')
    if (isProperty) el.setAttribute('property', name)
    else el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content || '')
}

function formatDate(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return d
  }
}

function formatDateShort(d) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'A'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}
