import axios from 'axios'
import { notifyAdminToast } from '../admin/adminToast'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

client.interceptors.response.use(
  (response) => {
    const method = String(response?.config?.method || '').toLowerCase()
    const url = String(response?.config?.url || '')
    const isAdminMutation =
      ['post', 'put', 'patch', 'delete'].includes(method) &&
      url.startsWith('/api/admin')
    const isSilentPath =
      url.includes('/login') ||
      url.includes('/logout') ||
      url.includes('/cms/upload') ||
      url.includes('/me')
    if (isAdminMutation && !isSilentPath) {
      const methodMessage = method === 'delete'
        ? 'Deleted successfully'
        : method === 'post'
          ? 'Saved successfully'
          : 'Updated successfully'
      notifyAdminToast(methodMessage, 'success')
    }
    return response
  },
  (error) => {
    const method = String(error?.config?.method || '').toLowerCase()
    const url = String(error?.config?.url || '')
    const isAdminMutation =
      ['post', 'put', 'patch', 'delete'].includes(method) &&
      url.startsWith('/api/admin')
    if (isAdminMutation) {
      notifyAdminToast(error?.response?.data?.error || 'Action failed', 'error')
    }
    return Promise.reject(error)
  },
)

export default client
