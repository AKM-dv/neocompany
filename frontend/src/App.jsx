import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CMSProvider } from './context/CMSContext'
import UserLayout from './user/UserLayout'
import Home from './user/pages/Home'
import Services from './user/pages/Services'
import ServiceDetail from './user/pages/ServiceDetail'
import Checkout from './user/pages/Checkout'
import BookingConfirmation from './user/pages/BookingConfirmation'
import AboutUs from './user/pages/AboutUs'
import ContactUs from './user/pages/ContactUs'
import Policies from './user/pages/Policies'
import BlogList from './user/pages/BlogList'
import BlogDetail from './user/pages/BlogDetail'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
import ManageCategories from './admin/pages/ManageCategories'
import ManageServices from './admin/pages/ManageServices'
import ManageBookings from './admin/pages/ManageBookings'
import ThemeSettings from './admin/pages/ThemeSettings'
import HeroEditor from './admin/pages/HeroEditor'
import CMSPages from './admin/pages/CMSPages'
import ManageBlogs from './admin/pages/ManageBlogs'
import Reports from './admin/pages/Reports'
import BrandingSettings from './admin/pages/BrandingSettings'
import ContactMessages from './admin/pages/ContactMessages'
import AdminGuard from './admin/AdminGuard'

export default function App() {
  return (
    <CMSProvider>
      <CartProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:id" element={<ServiceDetail />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="booking/confirmed" element={<BookingConfirmation />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="policies/:slug" element={<Policies />} />
              <Route path="blog" element={<BlogList />} />
              <Route path="blog/:slug" element={<BlogDetail />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="categories" element={<ManageCategories />} />
              <Route path="services" element={<ManageServices />} />
              <Route path="bookings" element={<ManageBookings />} />
              <Route path="theme" element={<ThemeSettings mode="palettes" />} />
              <Route path="site/branding" element={<BrandingSettings />} />
              <Route path="site/palettes" element={<ThemeSettings mode="palettes" />} />
              <Route path="hero" element={<HeroEditor />} />
              <Route path="cms" element={<CMSPages />} />
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="contact-messages" element={<ContactMessages />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </CMSProvider>
  )
}
