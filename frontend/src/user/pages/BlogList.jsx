import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiArrowUpRight, FiClock, FiSearch, FiUser } from 'react-icons/fi'
import client from '../../api/client'
import './Blog.css'

export default function BlogList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    client
      .get('/api/blogs')
      .then((r) => setItems(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => [...new Set(items.map((b) => b.category).filter(Boolean))],
    [items],
  )

  const filtered = useMemo(() => {
    return items.filter((b) => {
      if (category && b.category !== category) return false
      if (!q.trim()) return true
      const needle = q.toLowerCase()
      return (
        (b.title || '').toLowerCase().includes(needle) ||
        (b.excerpt || '').toLowerCase().includes(needle)
      )
    })
  }, [items, q, category])

  const featured = filtered.find((b) => b.is_featured) || filtered[0]
  const grid = filtered.filter((b) => b.id !== featured?.id)

  return (
    <div className="container page-pad blog-shell">
      <header className="blog-header">
        <h1 className="hero-font">Insights & Stories</h1>
        <p>Professional guides, ideas and updates from our service experts.</p>
      </header>

      <div className="blog-filters">
        <div className="blog-search">
          <FiSearch />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search blog..." />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="blog-result-count">{filtered.length} article{filtered.length === 1 ? '' : 's'}</div>
      </div>

      {loading ? (
        <p>Loading blogs...</p>
      ) : (
        <>
          {featured && (
            <article className="blog-featured" onClick={() => navigate(`/blog/${featured.slug}`)} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate(`/blog/${featured.slug}`)}>
              <img src={featured.featured_image_url || 'https://placehold.co/1200x520'} alt="" />
              <div className="blog-featured-content">
                <span className="blog-chip">Featured</span>
                <h2 className="hero-font">{featured.title}</h2>
                <p>{featured.excerpt || featured.meta_description}</p>
                <div className="blog-meta">
                  <span>
                    <FiUser /> {featured.author_name || 'Admin'}
                  </span>
                  <span>
                    <FiClock /> {featured.read_time_minutes || 5} min read
                  </span>
                  <span>{formatDate(featured.published_at)}</span>
                </div>
                <Link to={`/blog/${featured.slug}`} className="blog-read-btn">
                  Read More
                </Link>
              </div>
            </article>
          )}

          <section className="blog-grid">
            {grid.map((b) => (
              <article
                key={b.id}
                className="blog-card"
                onClick={() => navigate(`/blog/${b.slug}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/blog/${b.slug}`)}
              >
                <img src={b.featured_image_url || 'https://placehold.co/800x520'} alt="" />
                <div className="blog-card-body">
                  <div className="blog-card-top">
                    <span className="blog-chip subtle">{b.category || 'General'}</span>
                    <span className="blog-card-arrow">
                      <FiArrowUpRight />
                    </span>
                  </div>
                  <h3 className="hero-font">{b.title}</h3>
                  <p>{b.excerpt || b.meta_description}</p>
                  <div className="blog-card-footer">
                    <div className="blog-author">
                      <span className="blog-author-avatar">{getInitials(b.author_name)}</span>
                      <span className="blog-author-name">{b.author_name || 'Admin'}</span>
                    </div>
                    <span className="blog-date">{formatDateShort(b.published_at)}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  )
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
