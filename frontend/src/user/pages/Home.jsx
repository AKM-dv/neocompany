import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiTrendingUp } from 'react-icons/fi'
import client from '../../api/client'
import HeroBanner from '../../components/HeroBanner'
import ServiceCard from '../../components/ServiceCard'
import { useCMS } from '../../context/CMSContext'
import './Home.css'

export default function Home() {
  const { cms } = useCMS()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    client.get('/api/categories').then((r) => setCategories(r.data || []))
    client.get('/api/services').then((r) => setServices((r.data || []).slice(0, 6)))
  }, [])

  let trust = []
  let steps = []
  try {
    trust = JSON.parse(cms.trust_stats || '[]')
  } catch {
    trust = []
  }
  try {
    steps = JSON.parse(cms.how_it_works || '[]')
  } catch {
    steps = []
  }

  const iconMap = {
    check: '✓',
    star: '★',
    city: '🏙',
    lock: '🔒',
  }

  return (
    <>
      <HeroBanner />

      <section className="home-section">
        <div className="container">
          <div className="home-cats-head fade-up">
            <h2 className="section-title center hero-font">
              <FiSearch className="home-section-icon" aria-hidden />
              What are you looking for?
            </h2>
            <p className="home-cats-sub">Choose a category to quickly discover the right services.</p>
          </div>
          <div className="home-cats">
            {categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/services?category_id=${c.id}`}
                className="home-cat-card fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="home-cat-icon-wrap">
                  {c.image_url || c.icon_url ? (
                    <img src={c.image_url || c.icon_url} alt={c.name || 'Category'} className="home-cat-icon" />
                  ) : (
                    <span className="home-cat-placeholder" />
                  )}
                </div>
                <span className="home-cat-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-popular">
        <div className="container popular-head">
          <h2 className="section-title hero-font">Popular Services</h2>
          <FiTrendingUp className="home-trending-icon" aria-hidden />
          <Link to="/services" className="view-all">
            View All →
          </Link>
        </div>
        <div className="container service-grid">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-inner">
          {trust.map((t, i) => (
            <div key={i} className="trust-item">
              <span className="trust-ico">{iconMap[t.icon] || '•'}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="container how-it-works">
          {steps.map((s, i) => (
            <div key={i} className="how-step fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="how-num hero-font">{i + 1}</span>
              <div className="how-icon-circle">✦</div>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-desc">{s.desc}</p>
              {i < steps.length - 1 && <span className="how-arrow desktop-only" aria-hidden>→</span>}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
