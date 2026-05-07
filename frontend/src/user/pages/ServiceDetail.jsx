import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../../api/client'
import { useCart } from '../../context/CartContext'
import { useCMS } from '../../context/CMSContext'
import './ServiceDetail.css'

export default function ServiceDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { formatCurrency } = useCMS()
  const [svc, setSvc] = useState(null)
  const [qty, setQty] = useState(1)
  const [flash, setFlash] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    client
      .get(`/api/services/${id}`)
      .then((r) => setSvc(r.data))
      .catch(() => setSvc(null))
  }, [id])

  const images = (svc?.image_urls && svc.image_urls.length
    ? svc.image_urls
    : svc?.image_url
      ? [svc.image_url]
      : []) || []

  useEffect(() => {
    setImgIdx(0)
  }, [id, images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(() => {
      setImgIdx((p) => (p + 1) % images.length)
    }, 2500)
    return () => clearInterval(t)
  }, [images.length])

  if (!svc) {
    return (
      <div className="container page-pad">
        <p>Loading or not found.</p>
      </div>
    )
  }

  const onAdd = () => {
    addToCart(svc, qty)
    setFlash(true)
    setTimeout(() => setFlash(false), 1000)
  }

  return (
    <div className="container page-pad">
      <nav className="breadcrumb-light">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/services">Services</Link>
        <span>/</span>
        <span>{svc.category_name}</span>
        <span>/</span>
        <span>{svc.name}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-media">
          {images.length ? (
            <img src={images[imgIdx]} alt="" className="detail-img" />
          ) : (
            <div className="detail-img-ph" />
          )}
          {images.length > 1 && (
            <div className="detail-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`detail-dot ${i === imgIdx ? 'active' : ''}`}
                  onClick={() => setImgIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                />
              ))}
            </div>
          )}
          {svc.category_name && (
            <span className="detail-cat-pill">{svc.category_name}</span>
          )}
        </div>
        <div className="detail-info">
          <h1 className="detail-title hero-font">{svc.name}</h1>
          <div className="detail-meta">
            <span>🕐 {svc.duration_minutes} min</span>
            {svc.category_name && (
              <span className="detail-tag">{svc.category_name}</span>
            )}
          </div>
          <div className="detail-price mono">{formatCurrency(svc.price)}</div>
          <hr className="detail-hr" />
          <h2 className="detail-h2">About this Service</h2>
          <div
            className="detail-desc cms-content"
            dangerouslySetInnerHTML={{ __html: svc.description || '' }}
          />

          <div className="detail-qty">
            <span>Quantity</span>
            <div className="qty-stepper large">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="mono">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className={`btn-detail-add ${flash ? 'btn-add-flash' : ''}`}
            onClick={onAdd}
          >
            🛒 Add to Cart
          </button>
          <p className="detail-trust">
            ✓ Confirmed by admin after booking · COD accepted
          </p>
        </div>
      </div>
    </div>
  )
}
