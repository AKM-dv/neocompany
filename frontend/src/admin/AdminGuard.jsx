import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import client from '../api/client'
import { useCMS } from '../context/CMSContext'
import { getAdminThemeCssVars } from './adminTheme'
import './AdminLayout.css'

export default function AdminGuard({ children }) {
  const { cms, activePalette } = useCMS()
  const [state, setState] = useState('loading')
  const guardStyle = useMemo(() => {
    const mode =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('admin_mode') || 'light'
        : 'light'
    return getAdminThemeCssVars(activePalette, cms, mode === 'light' ? 'light' : 'dark')
  }, [activePalette, cms])

  useEffect(() => {
    client
      .get('/api/admin/me')
      .then((r) => {
        setState(r.data?.logged_in ? 'ok' : 'out')
      })
      .catch(() => setState('out'))
  }, [])

  if (state === 'loading') {
    return (
      <div className="admin-loading" style={guardStyle}>
        <div className="admin-spinner" />
      </div>
    )
  }
  if (state === 'out') {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
