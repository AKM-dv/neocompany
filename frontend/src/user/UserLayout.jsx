import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import BugReportWidget from '../components/BugReportWidget'
import WhatsAppFloatButton from '../components/WhatsAppFloatButton'
import PageTransitionOverlay from '../components/PageTransitionOverlay'
import { useCart } from '../context/CartContext'
import { useCMS } from '../context/CMSContext'

export default function UserLayout() {
  const location = useLocation()
  const { openDrawer } = useCart()
  const { cms } = useCMS()
  const [showTransition, setShowTransition] = useState(true)

  useEffect(() => {
    setShowTransition(true)
    const timer = window.setTimeout(() => setShowTransition(false), 620)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  const tone = useMemo(() => {
    const color = String(cms.primary_color || '#1A1A2E').replace('#', '')
    if (color.length !== 6) return 'light'
    const r = parseInt(color.slice(0, 2), 16)
    const g = parseInt(color.slice(2, 4), 16)
    const b = parseInt(color.slice(4, 6), 16)
    if ([r, g, b].some(Number.isNaN)) return 'light'
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance < 0.5 ? 'dark' : 'light'
  }, [cms.primary_color])

  return (
    <>
      <Navbar onOpenCart={openDrawer} />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <BugReportWidget />
      <WhatsAppFloatButton />
      <PageTransitionOverlay
        active={showTransition}
        logoUrl={cms.logo_url || ''}
        brandName={cms.site_name || 'Brand'}
        tone={tone}
      />
    </>
  )
}
