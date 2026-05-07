import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCMS } from '../context/CMSContext'
import './CartDrawer.css'

export default function CartDrawer() {
  const {
    drawerOpen,
    closeDrawer,
    items,
    subtotal,
    setQuantity,
    removeItem,
  } = useCart()
  const { formatCurrency } = useCMS()

  if (!drawerOpen) return null

  return (
    <>
      <button type="button" className="cart-backdrop" aria-label="Close cart" onClick={closeDrawer} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer-header">
          <div>
            <h2 id="cart-title" className="cart-title hero-font">
              Your Cart
            </h2>
            <span className="cart-count-pill">{items.length} items</span>
          </div>
          <button type="button" className="cart-close" aria-label="Close" onClick={closeDrawer}>
            ×
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7h15l-1.5 9h-12L6 7Zm0 0L5 3H2"
                    stroke="#ccc"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <h3 className="hero-font">Your cart is empty</h3>
              <Link to="/services" className="btn-secondary" onClick={closeDrawer}>
                Browse our services
              </Link>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((line) => (
                <li key={line.serviceId} className="cart-line">
                  <div className="cart-thumb-wrap">
                    {line.image_url ? (
                      <img src={line.image_url} alt="" className="cart-thumb" />
                    ) : (
                      <div className="cart-thumb-placeholder" />
                    )}
                  </div>
                  <div className="cart-line-main">
                    <div className="cart-line-top">
                      <span className="cart-line-name">{line.name}</span>
                      <button
                        type="button"
                        className="cart-remove"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => removeItem(line.serviceId)}
                      >
                        🗑
                      </button>
                    </div>
                    {line.categoryName && (
                      <span className="cart-cat-pill">{line.categoryName}</span>
                    )}
                    <div className="cart-line-bottom">
                      <span className="cart-price mono">
                        {formatCurrency(line.price)}
                      </span>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          aria-label="Decrease"
                          onClick={() =>
                            setQuantity(line.serviceId, line.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span className="mono">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase"
                          onClick={() =>
                            setQuantity(line.serviceId, line.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span className="mono">{formatCurrency(subtotal)}</span>
            </div>
            <p className="cart-note">Final amount confirmed at checkout</p>
            <Link to="/checkout" className="btn-cart-checkout" onClick={closeDrawer}>
              Proceed to Checkout
            </Link>
            <button type="button" className="cart-continue" onClick={closeDrawer}>
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
