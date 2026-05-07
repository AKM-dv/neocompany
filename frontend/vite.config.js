import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Use VITE_BASE_PATH for GitHub Pages project sites (e.g. /repo-name/). Default "/".
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = env.VITE_BASE_PATH || '/'
  if (!base.endsWith('/')) base = `${base}/`

  return {
    plugins: [react()],
    base,
    server: {
      proxy: {
        '/api': { target: 'http://127.0.0.1:5001', changeOrigin: true },
        '/uploads': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      },
    },
  }
})
