import './PageTransitionOverlay.css'

export default function PageTransitionOverlay({
  active,
  logoUrl,
  brandName = 'Brand',
  tone = 'light',
}) {
  return (
    <div
      className={`page-transition-overlay ${active ? 'show' : ''} ${tone === 'dark' ? 'dark' : 'light'}`}
      aria-hidden={!active}
    >
      <div className="page-transition-center">
        {logoUrl ? (
          <img src={logoUrl} alt={brandName} className="page-transition-logo" />
        ) : (
          <div className="page-transition-fallback">{String(brandName || 'B').slice(0, 1).toUpperCase()}</div>
        )}
      </div>
    </div>
  )
}
