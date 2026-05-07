import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import { getAdminThemeCssVars } from '../adminTheme'
import '../AdminLayout.css'
import './AdminLogin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { cms, activePalette } = useCMS()
  const [mode] = useState(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem('admin_mode') || 'dark' : 'dark',
  )
  const loginShellStyle = useMemo(
    () => getAdminThemeCssVars(activePalette, cms, mode === 'light' ? 'light' : 'dark'),
    [activePalette, cms, mode],
  )
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await client.post('/api/admin/login', { username, password })
      navigate('/admin')
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Login failed')
    }
  }

  const brand = (cms.site_name || '').trim() || 'ServiceBook'

  return (
    <div className="admin-login-page" style={loginShellStyle}>
      <div className="admin-login-card">
        <div className="admin-login-brand">{brand}</div>
        <h1 className="admin-login-title">Admin Panel</h1>
        <form onSubmit={submit} className="admin-login-form">
          <div className="admin-field">
            <label htmlFor="aduser">Username</label>
            <input
              id="aduser"
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="adpass">Password</label>
            <input
              id="adpass"
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && <div className="admin-login-error">{err}</div>}
          <button type="submit" className="admin-btn admin-btn-primary admin-login-submit">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
