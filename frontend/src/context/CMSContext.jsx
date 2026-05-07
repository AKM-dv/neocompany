import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import client from '../api/client'

const CMSContext = createContext(null)
const FONT_LINK_ID = 'dynamic-google-fonts'

function loadGoogleFonts(primary, secondary) {
  if (typeof document === 'undefined') return
  const families = [primary, secondary].filter(Boolean)
  if (!families.length) return
  const unique = [...new Set(families)]
  const familyParam = unique
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700;800`)
    .join('&')
  const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`
  let link = document.getElementById(FONT_LINK_ID)
  if (!link) {
    link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = href
}

function upsertMetaTag(selector, attrs, content) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute('content', content || '')
}

function upsertLinkTag(selector, attrs) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('link')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

function inferIconMime(href) {
  const path = (href || '').split('?')[0]
  const ext = path.includes('.') ? path.split('.').pop()?.toLowerCase() : ''
  if (ext === 'svg') return 'image/svg+xml'
  if (ext === 'ico') return 'image/x-icon'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  return 'image/png'
}

/** OG crawlers need absolute URLs */
function absolutePublicUrl(url) {
  if (typeof window === 'undefined' || !url) return url || ''
  const u = String(url).trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  const origin = window.location.origin
  if (u.startsWith('/')) return origin + u
  return `${origin}/${u}`
}

function themeColorFromCms(cms) {
  try {
    const paletteLibrary = JSON.parse(cms.palette_library || cms.theme_library || '[]')
    if (!Array.isArray(paletteLibrary)) return cms.primary_color || '#1A1A2E'
    const activeId = cms.active_palette_id || cms.active_theme_id || ''
    const active = paletteLibrary.find((p) => p.id === activeId)
    if (active?.primary_color) return active.primary_color
  } catch {
    /* ignore */
  }
  return cms.primary_color || '#1A1A2E'
}

/** Tab icon, meta description, Open Graph / Twitter — driven by CMS branding */
export function applyBrandingHeadTags(cms) {
  if (typeof document === 'undefined') return
  const siteName = (cms.site_name || '').trim() || 'ServiceBook'
  const tagline = (cms.site_tagline || '').trim()
  const desc =
    (cms.brand_description || '').trim() ||
    tagline ||
    'Professional service booking platform'

  const browserTitle = (cms.browser_title || '').trim()
  document.title = browserTitle || (tagline ? `${siteName} · ${tagline}` : siteName)

  const ogTitle = (cms.og_title || '').trim() || siteName
  const ogImageRaw = (cms.og_image_url || cms.logo_url || cms.favicon_url || '').trim()
  const ogImage = ogImageRaw ? absolutePublicUrl(ogImageRaw) : ''

  const faviconHref = (cms.favicon_url || cms.logo_url || '').trim() || '/favicon.svg'
  const faviconType = inferIconMime(faviconHref)
  upsertLinkTag('link[rel="icon"]', {
    rel: 'icon',
    type: faviconType,
    href: faviconHref,
  })
  upsertLinkTag('link[rel="shortcut icon"]', {
    rel: 'shortcut icon',
    href: faviconHref,
  })

  const appleIcon = (cms.favicon_url || cms.logo_url || '').trim()
  if (appleIcon) {
    upsertLinkTag('link[rel="apple-touch-icon"]', {
      rel: 'apple-touch-icon',
      href: appleIcon,
    })
  }

  upsertMetaTag('meta[name="description"]', { name: 'description' }, desc)
  upsertMetaTag('meta[property="og:title"]', { property: 'og:title' }, ogTitle)
  upsertMetaTag(
    'meta[property="og:description"]',
    { property: 'og:description' },
    desc,
  )
  upsertMetaTag('meta[property="og:type"]', { property: 'og:type' }, 'website')
  upsertMetaTag('meta[property="og:site_name"]', { property: 'og:site_name' }, siteName)
  upsertMetaTag(
    'meta[property="og:url"]',
    { property: 'og:url' },
    typeof window !== 'undefined' ? `${window.location.origin}/` : '',
  )
  upsertMetaTag('meta[name="theme-color"]', { name: 'theme-color' }, themeColorFromCms(cms))
  if (ogImage) {
    upsertMetaTag('meta[property="og:image"]', { property: 'og:image' }, ogImage)
    upsertMetaTag(
      'meta[name="twitter:image"]',
      { name: 'twitter:image' },
      ogImage,
    )
    if (ogImage.startsWith('https://')) {
      upsertMetaTag(
        'meta[property="og:image:secure_url"]',
        { property: 'og:image:secure_url' },
        ogImage,
      )
    }
    upsertMetaTag(
      'meta[property="og:image:alt"]',
      { property: 'og:image:alt' },
      siteName,
    )
  } else {
    upsertMetaTag('meta[property="og:image"]', { property: 'og:image' }, '')
    upsertMetaTag('meta[name="twitter:image"]', { name: 'twitter:image' }, '')
  }
  upsertMetaTag(
    'meta[name="twitter:card"]',
    { name: 'twitter:card' },
    ogImage ? 'summary_large_image' : 'summary',
  )
  upsertMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' }, ogTitle)
  upsertMetaTag(
    'meta[name="twitter:description"]',
    { name: 'twitter:description' },
    desc,
  )
}

export function CMSProvider({ children }) {
  const [cms, setCms] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cmsRef = useRef(cms)
  cmsRef.current = cms

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/api/cms')
      setCms(data || {})
    } catch (e) {
      setError(e?.message || 'Failed to load site settings')
      setCms({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const root = document.documentElement
    let paletteLibrary = []
    let uiThemeLibrary = []
    try {
      paletteLibrary = JSON.parse(cms.palette_library || cms.theme_library || '[]')
      if (!Array.isArray(paletteLibrary)) paletteLibrary = []
    } catch {
      paletteLibrary = []
    }
    try {
      uiThemeLibrary = JSON.parse(cms.ui_theme_library || '[]')
      if (!Array.isArray(uiThemeLibrary)) uiThemeLibrary = []
    } catch {
      uiThemeLibrary = []
    }
    const activePaletteId = cms.active_palette_id || cms.active_theme_id || ''
    const activePalette = paletteLibrary.find((p) => p.id === activePaletteId) || null
    const source = activePalette || cms
    const activeUiThemeId = cms.active_ui_theme_id || ''
    const activeUiTheme = uiThemeLibrary.find((t) => t.id === activeUiThemeId) || null

    const primary = source.primary_color || '#1A1A2E'
    const accent = source.accent_color || '#E8622A'
    const surface = source.surface_color || '#F7F5F0'
    root.style.setProperty('--primary', primary)
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--surface', surface)
    root.style.setProperty('--secondary', source.secondary_color || '#16213E')
    const primaryFont = source.primary_font_family || source.font_family || 'Syne'
    const secondaryFont = source.secondary_font_family || 'DM Sans'
    loadGoogleFonts(primaryFont, secondaryFont)
    root.style.setProperty('--font-display', `"${primaryFont}", system-ui, sans-serif`)
    root.style.setProperty('--font-body', `"${secondaryFont}", system-ui, sans-serif`)
    const primaryScale = Number(source.primary_text_scale || 1)
    const secondaryScale = Number(source.secondary_text_scale || 1)
    root.style.setProperty('--font-size-primary-scale', String(Math.min(1.6, Math.max(0.8, primaryScale))))
    root.style.setProperty('--font-size-secondary-scale', String(Math.min(1.4, Math.max(0.85, secondaryScale))))
    const r = source.button_radius || '10'
    root.style.setProperty('--radius-button', `${r}px`)
    root.style.setProperty('--radius-card', `${Math.min(24, Number(r) + 6)}px`)
    document.body.dataset.uiTheme = activeUiTheme?.layout_mode || 'default'
  }, [cms])

  useEffect(() => {
    applyBrandingHeadTags(cms)
  }, [cms])

  const reapplyBrandingHead = useCallback(() => {
    applyBrandingHeadTags(cmsRef.current)
  }, [])

  const value = useMemo(
    () => {
      let paletteLibrary = []
      let uiThemeLibrary = []
      try {
        const parsed = JSON.parse(cms.palette_library || cms.theme_library || '[]')
        paletteLibrary = Array.isArray(parsed) ? parsed : []
      } catch {
        paletteLibrary = []
      }
      try {
        const parsed = JSON.parse(cms.ui_theme_library || '[]')
        uiThemeLibrary = Array.isArray(parsed) ? parsed : []
      } catch {
        uiThemeLibrary = []
      }
      const activePaletteId = cms.active_palette_id || cms.active_theme_id || ''
      const activeUiThemeId = cms.active_ui_theme_id || ''
      const currencyCode = String(cms.currency_code || 'INR').toUpperCase()
      const formatCurrency = (amount) => {
        const num = Number(amount || 0)
        try {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 2,
          }).format(num)
        } catch {
          return `INR ${num.toFixed(2)}`
        }
      }
      return {
        cms,
        loading,
        error,
        refresh,
        setCms,
        reapplyBrandingHead,
        paletteLibrary,
        uiThemeLibrary,
        currencyCode,
        formatCurrency,
        activePalette: paletteLibrary.find((p) => p.id === activePaletteId) || null,
        activeUiTheme: uiThemeLibrary.find((t) => t.id === activeUiThemeId) || null,
      }
    },
    [cms, loading, error, refresh, reapplyBrandingHead],
  )

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>
}

export function useCMS() {
  const ctx = useContext(CMSContext)
  if (!ctx) throw new Error('useCMS must be used within CMSProvider')
  return ctx
}
