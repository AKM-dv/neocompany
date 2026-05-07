import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCMS } from '../context/CMSContext'
import { excerptPlain } from '../utils/html'
import './ServiceCard.css'

export default function ServiceCard({ service, showAdd = true }) {
  const { addToCart } = useCart()
  const { formatCurrency } = useCMS()
  const [flash, setFlash] = useState(false)

  const onAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(service, 1)
    setFlash(true)
    setTimeout(() => setFlash(false), 1000)
  }

  return (
    <article className="service-card">
      <Link to={`/services/${service.id}`} className="service-card-link">
        <div className="service-card-image-wrap">
          {service.image_url ? (
            <img src={service.image_url} alt="" className="service-card-img" />
          ) : (
            <div className="service-card-img-ph" />
          )}
          {service.category_name && (
            <span className="service-card-cat">{service.category_name}</span>
          )}
        </div>
        <div className="service-card-body">
          <h3 className="service-card-title hero-font">{service.name}</h3>
          <div className="service-meta">
            <span>🕐</span> {service.duration_minutes} min
          </div>
          <p className="service-card-desc">{excerptPlain(service.description)}</p>
          <div className="service-card-row">
            <span className="service-price mono">{formatCurrency(service.price)}</span>
            {showAdd && (
              <button
                type="button"
                className={`btn-add-cart ${flash ? 'btn-add-flash' : ''}`}
                onClick={onAdd}
              >
                {flash ? '✓ Added' : 'Add to Cart'}
              </button>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
