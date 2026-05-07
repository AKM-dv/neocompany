import { useEffect, useMemo, useState } from 'react'
import { useCMS } from '../../context/CMSContext'
import client from '../../api/client'
import '../AdminLayout.css'

const fallbackFonts = [
  { family: 'Syne', category: 'sans-serif' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Roboto', category: 'sans-serif' },
]

const prebuiltPalettes = [
  {
    id: 'sunset_pro',
    name: 'Sunset Pro',
    primary_color: '#1A1A2E',
    secondary_color: '#16213E',
    accent_color: '#E8622A',
    surface_color: '#F7F5F0',
    primary_font_family: 'Syne',
    secondary_font_family: 'DM Sans',
    primary_text_scale: '1.05',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'ocean_clean',
    name: 'Ocean Clean',
    primary_color: '#0B3C5D',
    secondary_color: '#328CC1',
    accent_color: '#D9B310',
    surface_color: '#F5F9FD',
    primary_font_family: 'Poppins',
    secondary_font_family: 'Inter',
    primary_text_scale: '1.03',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'forest_luxe',
    name: 'Forest Luxe',
    primary_color: '#1B4332',
    secondary_color: '#2D6A4F',
    accent_color: '#40916C',
    surface_color: '#F1FAEE',
    primary_font_family: 'Playfair Display',
    secondary_font_family: 'Lora',
    primary_text_scale: '1.08',
    secondary_text_scale: '1.00',
    button_radius: '12',
  },
  {
    id: 'midnight_glass',
    name: 'Midnight Glass',
    primary_color: '#111827',
    secondary_color: '#374151',
    accent_color: '#22D3EE',
    surface_color: '#F3F4F6',
    primary_font_family: 'Montserrat',
    secondary_font_family: 'Roboto',
    primary_text_scale: '1.02',
    secondary_text_scale: '1.00',
    button_radius: '8',
  },
  {
    id: 'royal_contrast',
    name: 'Royal Contrast',
    primary_color: '#1E1B4B',
    secondary_color: '#312E81',
    accent_color: '#F59E0B',
    surface_color: '#F8FAFC',
    primary_font_family: 'Syne',
    secondary_font_family: 'Inter',
    primary_text_scale: '1.06',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'emerald_clarity',
    name: 'Emerald Clarity',
    primary_color: '#064E3B',
    secondary_color: '#065F46',
    accent_color: '#10B981',
    surface_color: '#F0FDF4',
    primary_font_family: 'Poppins',
    secondary_font_family: 'DM Sans',
    primary_text_scale: '1.04',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'graphite_lime',
    name: 'Graphite Lime',
    primary_color: '#111827',
    secondary_color: '#374151',
    accent_color: '#84CC16',
    surface_color: '#F9FAFB',
    primary_font_family: 'Montserrat',
    secondary_font_family: 'Roboto',
    primary_text_scale: '1.03',
    secondary_text_scale: '1.00',
    button_radius: '9',
  },
  {
    id: 'burgundy_gold',
    name: 'Burgundy Gold',
    primary_color: '#4A102A',
    secondary_color: '#7A1F44',
    accent_color: '#EAB308',
    surface_color: '#FFF7ED',
    primary_font_family: 'Playfair Display',
    secondary_font_family: 'Lora',
    primary_text_scale: '1.08',
    secondary_text_scale: '1.00',
    button_radius: '12',
  },
  {
    id: 'indigo_mint',
    name: 'Indigo Mint',
    primary_color: '#1D4ED8',
    secondary_color: '#0F766E',
    accent_color: '#14B8A6',
    surface_color: '#F0FDFA',
    primary_font_family: 'Inter',
    secondary_font_family: 'DM Sans',
    primary_text_scale: '1.03',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'charcoal_orange',
    name: 'Charcoal Orange',
    primary_color: '#0F172A',
    secondary_color: '#1E293B',
    accent_color: '#FB923C',
    surface_color: '#F8FAFC',
    primary_font_family: 'Syne',
    secondary_font_family: 'Poppins',
    primary_text_scale: '1.04',
    secondary_text_scale: '1.00',
    button_radius: '10',
  },
  {
    id: 'plum_rose',
    name: 'Plum Rose',
    primary_color: '#581C87',
    secondary_color: '#7E22CE',
    accent_color: '#F43F5E',
    surface_color: '#FFF1F2',
    primary_font_family: 'Playfair Display',
    secondary_font_family: 'Inter',
    primary_text_scale: '1.07',
    secondary_text_scale: '1.00',
    button_radius: '12',
  },
  {
    id: 'mono_clean',
    name: 'Mono Clean',
    primary_color: '#111111',
    secondary_color: '#3A3A3A',
    accent_color: '#2563EB',
    surface_color: '#F5F5F5',
    primary_font_family: 'Inter',
    secondary_font_family: 'Roboto',
    primary_text_scale: '1.02',
    secondary_text_scale: '1.00',
    button_radius: '8',
  },
]

const prebuiltUiThemes = [
  { id: 'ui_default', name: 'Default Premium', layout_mode: 'default', theme_type: 'react' },
  { id: 'ui_editorial', name: 'Editorial', layout_mode: 'editorial', theme_type: 'react' },
  { id: 'ui_compact', name: 'Compact SaaS', layout_mode: 'compact', theme_type: 'react' },
  { id: 'ui_spacious', name: 'Spacious Luxury', layout_mode: 'spacious', theme_type: 'react' },
]

export default function ThemeSettings({ mode = 'all' }) {
  const { cms, refresh, formatCurrency } = useCMS()
  const [primary, setPrimary] = useState(cms.primary_color || '#1A1A2E')
  const [accent, setAccent] = useState(cms.accent_color || '#E8622A')
  const [surface, setSurface] = useState(cms.surface_color || '#F7F5F0')
  const [secondary, setSecondary] = useState(cms.secondary_color || '#16213E')
  const [primaryFont, setPrimaryFont] = useState(cms.primary_font_family || cms.font_family || 'Syne')
  const [secondaryFont, setSecondaryFont] = useState(cms.secondary_font_family || 'DM Sans')
  const [primaryTextScale, setPrimaryTextScale] = useState(Number(cms.primary_text_scale || 1))
  const [secondaryTextScale, setSecondaryTextScale] = useState(Number(cms.secondary_text_scale || 1))
  const [radius, setRadius] = useState(Number(cms.button_radius || 10))
  const [paletteLibrary, setPaletteLibrary] = useState([])
  const [activePaletteId, setActivePaletteId] = useState(cms.active_palette_id || cms.active_theme_id || '')
  const [newPaletteName, setNewPaletteName] = useState('')
  const [paletteUploadError, setPaletteUploadError] = useState('')
  const [uiThemeLibrary, setUiThemeLibrary] = useState([])
  const [activeUiThemeId, setActiveUiThemeId] = useState(cms.active_ui_theme_id || '')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateUseActivePalette, setTemplateUseActivePalette] = useState(true)
  const [templatePrimary, setTemplatePrimary] = useState('#1A1A2E')
  const [templateSecondary, setTemplateSecondary] = useState('#16213E')
  const [templateHeadingFont, setTemplateHeadingFont] = useState('Syne')
  const [templateBodyFont, setTemplateBodyFont] = useState('DM Sans')
  const [newUiThemeName, setNewUiThemeName] = useState('')
  const [htmlUploadError, setHtmlUploadError] = useState('')
  const [googleFonts, setGoogleFonts] = useState([])
  const [fontStatus, setFontStatus] = useState('')

  const fontOptions = useMemo(() => {
    const merged = [...googleFonts, ...fallbackFonts]
    const seen = new Set()
    return merged.filter((f) => {
      const key = (f.family || '').toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [googleFonts])

  useEffect(() => {
    setPrimary(cms.primary_color || '#1A1A2E')
    setAccent(cms.accent_color || '#E8622A')
    setSurface(cms.surface_color || '#F7F5F0')
    setSecondary(cms.secondary_color || '#16213E')
    setPrimaryFont(cms.primary_font_family || cms.font_family || 'Syne')
    setSecondaryFont(cms.secondary_font_family || 'DM Sans')
    setPrimaryTextScale(Number(cms.primary_text_scale || 1))
    setSecondaryTextScale(Number(cms.secondary_text_scale || 1))
    setRadius(Number(cms.button_radius || 10))
    setActivePaletteId(cms.active_palette_id || cms.active_theme_id || '')
    setActiveUiThemeId(cms.active_ui_theme_id || '')
    try {
      const parsed = JSON.parse(cms.palette_library || cms.theme_library || '[]')
      setPaletteLibrary(Array.isArray(parsed) ? parsed : [])
    } catch {
      setPaletteLibrary([])
    }
    try {
      const parsed = JSON.parse(cms.ui_theme_library || '[]')
      setUiThemeLibrary(Array.isArray(parsed) ? parsed : [])
    } catch {
      setUiThemeLibrary([])
    }
  }, [cms])

  useEffect(() => {
    if (!selectedTemplateId) {
      const active = uiThemeLibrary.find((t) => t.id === activeUiThemeId && t.theme_type === 'html')
      if (active) setSelectedTemplateId(active.id)
      return
    }
    if (!uiThemeLibrary.some((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId('')
    }
  }, [activeUiThemeId, selectedTemplateId, uiThemeLibrary])

  useEffect(() => {
    const selected = uiThemeLibrary.find((t) => t.id === selectedTemplateId)
    if (!selected) return
    const tok = selected.template_tokens || {}
    setTemplateUseActivePalette(tok.use_active_palette !== false)
    setTemplatePrimary(tok.primary_color || '#1A1A2E')
    setTemplateSecondary(tok.secondary_color || '#16213E')
    setTemplateHeadingFont(tok.heading_font || 'Syne')
    setTemplateBodyFont(tok.body_font || 'DM Sans')
  }, [selectedTemplateId, uiThemeLibrary])

  useEffect(() => {
    let mounted = true
    async function loadFonts() {
      try {
        const { data } = await client.get('/api/fonts/google')
        if (!mounted) return
        const items = Array.isArray(data?.items) ? data.items : []
        setGoogleFonts(items)
        if (data?.error) setFontStatus(data.error)
        else setFontStatus(items.length ? `${items.length} Google Fonts loaded` : 'No Google Fonts returned')
      } catch {
        if (!mounted) return
        setGoogleFonts([])
        setFontStatus('Failed to load Google Fonts API, fallback fonts available')
      }
    }
    loadFonts()
    return () => {
      mounted = false
    }
  }, [])

  const save = async () => {
    await client.put('/api/admin/cms', {
      primary_color: primary,
      accent_color: accent,
      surface_color: surface,
      secondary_color: secondary,
      font_family: primaryFont,
      primary_font_family: primaryFont,
      secondary_font_family: secondaryFont,
      primary_text_scale: String(primaryTextScale),
      secondary_text_scale: String(secondaryTextScale),
      button_radius: String(radius),
    })
    refresh()
  }

  const saveActivePalette = async () => {
    await client.put('/api/admin/cms', {
      active_palette_id: activePaletteId || '',
    })
    refresh()
  }

  const savePaletteLibrary = async (nextLibrary) => {
    await client.put('/api/admin/cms', {
      palette_library: JSON.stringify(nextLibrary),
    })
    setPaletteLibrary(nextLibrary)
    refresh()
  }

  const addCurrentAsPalette = async () => {
    const name = (newPaletteName || '').trim()
    if (!name) return
    const next = [
      ...paletteLibrary,
      {
        id: `palette_${Date.now()}`,
        name,
        primary_color: primary,
        accent_color: accent,
        surface_color: surface,
        secondary_color: secondary,
        font_family: primaryFont,
        primary_font_family: primaryFont,
        secondary_font_family: secondaryFont,
        primary_text_scale: String(primaryTextScale),
        secondary_text_scale: String(secondaryTextScale),
        button_radius: String(radius),
      },
    ]
    await savePaletteLibrary(next)
    setNewPaletteName('')
  }

  const removePalette = async (id) => {
    const next = paletteLibrary.filter((t) => t.id !== id)
    await savePaletteLibrary(next)
    if (activePaletteId === id) {
      setActivePaletteId('')
      await client.put('/api/admin/cms', { active_palette_id: '' })
      refresh()
    }
  }

  const onPaletteUpload = async (file) => {
    if (!file) return
    setPaletteUploadError('')
    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw)
      const palette = normalizePalette(parsed)
      if (!palette) {
        setPaletteUploadError('Invalid palette JSON')
        return
      }
      const next = [...paletteLibrary, palette]
      await savePaletteLibrary(next)
    } catch {
      setPaletteUploadError('Failed to parse palette JSON')
    }
  }

  const saveUiThemeLibrary = async (nextLibrary) => {
    await client.put('/api/admin/cms', {
      ui_theme_library: JSON.stringify(nextLibrary),
    })
    setUiThemeLibrary(nextLibrary)
    refresh()
  }

  const saveActiveUiTheme = async () => {
    await client.put('/api/admin/cms', {
      active_ui_theme_id: activeUiThemeId || '',
    })
    refresh()
  }

  const addPrebuiltUiThemes = async () => {
    const existingIds = new Set(uiThemeLibrary.map((t) => t.id))
    const merged = [...uiThemeLibrary]
    prebuiltUiThemes.forEach((t) => {
      if (!existingIds.has(t.id)) merged.push(t)
    })
    await saveUiThemeLibrary(merged)
  }

  const onHtmlThemeUpload = async (file) => {
    if (!file) return
    setHtmlUploadError('')
    try {
      const html = await file.text()
      if (!html || !html.includes('<')) {
        setHtmlUploadError('Invalid HTML theme file')
        return
      }
      const theme = {
        id: `html_theme_${Date.now()}`,
        name: (newUiThemeName || file.name || 'Uploaded HTML Theme').replace(/\.[^.]+$/, ''),
        theme_type: 'html',
        layout_mode: 'custom-html',
        html_content: html,
        template_tokens: {
          use_active_palette: true,
          primary_color: primary,
          secondary_color: secondary,
          heading_font: primaryFont || 'Syne',
          body_font: secondaryFont || 'DM Sans',
        },
      }
      const next = [...uiThemeLibrary, theme]
      await saveUiThemeLibrary(next)
      setNewUiThemeName('')
    } catch {
      setHtmlUploadError('Failed to read HTML theme file')
    }
  }

  const removeUiTheme = async (id) => {
    const next = uiThemeLibrary.filter((t) => t.id !== id)
    await saveUiThemeLibrary(next)
    if (activeUiThemeId === id) {
      setActiveUiThemeId('')
      await client.put('/api/admin/cms', { active_ui_theme_id: '' })
      refresh()
    }
  }

  const saveTemplateTokens = async () => {
    const target = uiThemeLibrary.find((t) => t.id === selectedTemplateId)
    if (!target) return
    const next = uiThemeLibrary.map((t) =>
      t.id !== selectedTemplateId
        ? t
        : {
            ...t,
            template_tokens: {
              use_active_palette: templateUseActivePalette,
              primary_color: templatePrimary,
              secondary_color: templateSecondary,
              heading_font: templateHeadingFont,
              body_font: templateBodyFont,
            },
          },
    )
    await saveUiThemeLibrary(next)
  }

  const exportActiveHtmlTheme = () => {
    const active = uiThemeLibrary.find((t) => t.id === activeUiThemeId)
    if (!active?.html_content) return
    const blob = new Blob([active.html_content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${active.name || 'theme'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setPrimary('#1A1A2E')
    setAccent('#E8622A')
    setSurface('#F7F5F0')
    setSecondary('#16213E')
    setPrimaryFont('Syne')
    setSecondaryFont('DM Sans')
    setPrimaryTextScale(1)
    setSecondaryTextScale(1)
    setRadius(10)
  }

  const applyPreset = (preset) => {
    setPrimary(preset.primary_color)
    setAccent(preset.accent_color)
    setSurface(preset.surface_color)
    setSecondary(preset.secondary_color)
    setPrimaryFont(preset.primary_font_family || 'Syne')
    setSecondaryFont(preset.secondary_font_family || 'DM Sans')
    setPrimaryTextScale(Number(preset.primary_text_scale || 1))
    setSecondaryTextScale(Number(preset.secondary_text_scale || 1))
    setRadius(Number(preset.button_radius || 10))
  }

  if (mode === 'palettes') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div className="admin-card">
          <h2 style={{ marginTop: 0 }}>Color Palette Management</h2>
          <div className="admin-field">
            <label>Pre-built Color Palettes</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {prebuiltPalettes.map((p) => (
                <div key={p.id} style={{ border: '1px solid var(--admin-border)', borderRadius: 8, padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong style={{ fontSize: 13 }}>{p.name}</strong>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => applyPreset(p)}>
                      Use
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[p.primary_color, p.secondary_color, p.accent_color, p.surface_color].map((c) => (
                      <span key={c} style={{ width: 24, height: 24, borderRadius: 999, border: '1px solid var(--admin-border)', background: c }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-field">
            <label>Active Palette</label>
            <select className="admin-input" value={activePaletteId} onChange={(e) => setActivePaletteId(e.target.value)}>
              <option value="">Default (manual values)</option>
              {paletteLibrary.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <div style={{ marginTop: 8 }}>
              <button type="button" className="admin-btn admin-btn-primary" onClick={saveActivePalette}>
                Apply Selected Palette
              </button>
            </div>
          </div>

          <div className="admin-field">
            <label>Upload External Palette (JSON)</label>
            <input type="file" accept="application/json,.json" onChange={(e) => onPaletteUpload(e.target.files?.[0])} />
            {paletteUploadError && <div style={{ color: 'var(--admin-danger)', marginTop: 6, fontSize: 12 }}>{paletteUploadError}</div>}
          </div>

          <div className="admin-field">
            <label>Save current values as reusable palette</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="admin-input" value={newPaletteName} onChange={(e) => setNewPaletteName(e.target.value)} placeholder="Palette name" />
              <button type="button" className="admin-btn admin-btn-ghost" onClick={addCurrentAsPalette}>Save</button>
            </div>
          </div>

          <div className="admin-field">
            <label>Primary</label>
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            <input className="admin-input" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Accent</label>
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            <input className="admin-input" value={accent} onChange={(e) => setAccent(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Surface</label>
            <input type="color" value={surface} onChange={(e) => setSurface(e.target.value)} />
            <input className="admin-input" value={surface} onChange={(e) => setSurface(e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Secondary</label>
            <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
            <input className="admin-input" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
          </div>
          <button type="button" className="admin-btn admin-btn-primary" onClick={save}>Save Palette Tokens</button>
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Palette Preview</h3>
          <div style={{ border: '1px solid var(--admin-border)', borderRadius: 10, padding: 12, background: surface }}>
            <div style={{ height: 42, borderRadius: 8, background: `linear-gradient(90deg, ${primary}, ${secondary})`, marginBottom: 10 }} />
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Service name</div>
            <div style={{ color: accent, fontWeight: 700, marginBottom: 8 }}>{formatCurrency(99)}</div>
            <button type="button" style={{ border: 'none', borderRadius: 8, background: accent, color: '#fff', padding: '8px 12px' }}>Book</button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'templates') {
    return (
      <div className="admin-card">
        <h2 style={{ marginTop: 0 }}>Theme / Site Template Management</h2>
        <p style={{ marginTop: 0, color: 'var(--admin-muted)', fontSize: 13 }}>
          Uploaded HTML templates can dynamically consume only: Primary, Secondary, Heading Font, Body Font.
          Use CSS vars <code>{'--primary'}</code>, <code>{'--secondary'}</code>, <code>{'--font-heading'}</code>, <code>{'--font-body'}</code>
          or placeholders {'{{primary}}'}, {'{{secondary}}'}, {'{{font_heading}}'}, {'{{font_body}}'}.
        </p>
        <div className="admin-field">
          <label>UI Theme Library</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addPrebuiltUiThemes}>
              Add Built-in UI Themes
            </button>
          </div>
          <select className="admin-input" value={activeUiThemeId} onChange={(e) => setActiveUiThemeId(e.target.value)}>
            <option value="">Default React Theme</option>
            {uiThemeLibrary.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.theme_type === 'html' ? '(HTML)' : '(React)'}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={saveActiveUiTheme}>Apply UI Theme</button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={exportActiveHtmlTheme}>Export Active HTML</button>
          </div>
        </div>

        <div className="admin-field">
          <label>Upload HTML Theme (single file)</label>
          <input className="admin-input" placeholder="Optional theme name" value={newUiThemeName} onChange={(e) => setNewUiThemeName(e.target.value)} />
          <input type="file" accept=".html,text/html" onChange={(e) => onHtmlThemeUpload(e.target.files?.[0])} />
          {htmlUploadError && <div style={{ color: 'var(--admin-danger)', marginTop: 6, fontSize: 12 }}>{htmlUploadError}</div>}
        </div>

        {uiThemeLibrary.length > 0 && (
          <div className="admin-field">
            <label>Uploaded UI Themes</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {uiThemeLibrary.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--admin-border)', padding: '8px 10px', borderRadius: 8 }}>
                  <span style={{ fontSize: 13 }}>{t.name} ({t.theme_type || 'react'})</span>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => removeUiTheme(t.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uiThemeLibrary.some((t) => t.theme_type === 'html') && (
          <div className="admin-field" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 12, marginTop: 12 }}>
            <label>Template Dynamic Customization</label>
            <select className="admin-input" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
              <option value="">Select uploaded HTML template</option>
              {uiThemeLibrary.filter((t) => t.theme_type === 'html').map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplateId && (
              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                <div className="admin-toggle-row">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={templateUseActivePalette}
                    aria-label={`Use active palette ${templateUseActivePalette ? 'enabled' : 'disabled'}`}
                    className={`admin-toggle ${templateUseActivePalette ? 'on' : ''}`}
                    onClick={() => setTemplateUseActivePalette((v) => !v)}
                  />
                  <span>Use active palette colors</span>
                </div>
                {!templateUseActivePalette && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--admin-muted)', marginBottom: 4 }}>Primary</label>
                      <input type="color" value={templatePrimary} onChange={(e) => setTemplatePrimary(e.target.value)} />
                      <input className="admin-input" value={templatePrimary} onChange={(e) => setTemplatePrimary(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--admin-muted)', marginBottom: 4 }}>Secondary</label>
                      <input type="color" value={templateSecondary} onChange={(e) => setTemplateSecondary(e.target.value)} />
                      <input className="admin-input" value={templateSecondary} onChange={(e) => setTemplateSecondary(e.target.value)} />
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--admin-muted)', marginBottom: 4 }}>Heading Font</label>
                    <select className="admin-input" value={templateHeadingFont} onChange={(e) => setTemplateHeadingFont(e.target.value)}>
                      {fontOptions.map((f) => <option key={`tpl_h_${f.family}`} value={f.family}>{f.family}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--admin-muted)', marginBottom: 4 }}>Body Font</label>
                    <select className="admin-input" value={templateBodyFont} onChange={(e) => setTemplateBodyFont(e.target.value)}>
                      {fontOptions.map((f) => <option key={`tpl_b_${f.family}`} value={f.family}>{f.family}</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" className="admin-btn admin-btn-primary" onClick={saveTemplateTokens}>
                  Save Template Dynamic Tokens
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
      <div className="admin-card">
        <h2 style={{ marginTop: 0 }}>Palette + Theme Engine</h2>
        <div className="admin-field">
          <label>Pre-built Color Palettes</label>
          <div style={{ display: 'grid', gap: 8 }}>
            {prebuiltPalettes.map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--admin-border)', borderRadius: 8, padding: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong style={{ fontSize: 13 }}>{p.name}</strong>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => applyPreset(p)}>
                    Use
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[p.primary_color, p.secondary_color, p.accent_color, p.surface_color].map((c) => (
                    <span key={c} style={{ width: 24, height: 24, borderRadius: 999, border: '1px solid var(--admin-border)', background: c }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-field">
          <label>Active Palette</label>
          <select
            className="admin-input"
            value={activePaletteId}
            onChange={(e) => setActivePaletteId(e.target.value)}
          >
            <option value="">Default (manual values)</option>
            {paletteLibrary.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 8 }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={saveActivePalette}>
              Apply Selected Palette
            </button>
          </div>
        </div>

        <div className="admin-field">
          <label>Upload External Palette (JSON)</label>
          <input type="file" accept="application/json,.json" onChange={(e) => onPaletteUpload(e.target.files?.[0])} />
          {paletteUploadError && <div style={{ color: 'var(--admin-danger)', marginTop: 6, fontSize: 12 }}>{paletteUploadError}</div>}
        </div>

        <div className="admin-field">
          <label>Save current values as reusable palette</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="admin-input"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              placeholder="Palette name"
            />
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addCurrentAsPalette}>
              Save
            </button>
          </div>
        </div>

        {paletteLibrary.length > 0 && (
          <div className="admin-field">
            <label>Palette Library</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {paletteLibrary.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--admin-border)', padding: '8px 10px', borderRadius: 8 }}>
                  <span style={{ fontSize: 13 }}>{t.name}</span>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => removePalette(t.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-field">
          <label>UI Theme Library</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addPrebuiltUiThemes}>
              Add Built-in UI Themes
            </button>
          </div>
          <select className="admin-input" value={activeUiThemeId} onChange={(e) => setActiveUiThemeId(e.target.value)}>
            <option value="">Default React Theme</option>
            {uiThemeLibrary.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.theme_type === 'html' ? '(HTML)' : '(React)'}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="admin-btn admin-btn-primary" onClick={saveActiveUiTheme}>
              Apply UI Theme
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={exportActiveHtmlTheme}>
              Export Active HTML
            </button>
          </div>
        </div>

        <div className="admin-field">
          <label>Upload HTML Theme (single file)</label>
          <input className="admin-input" placeholder="Optional theme name" value={newUiThemeName} onChange={(e) => setNewUiThemeName(e.target.value)} />
          <input type="file" accept=".html,text/html" onChange={(e) => onHtmlThemeUpload(e.target.files?.[0])} />
          {htmlUploadError && <div style={{ color: 'var(--admin-danger)', marginTop: 6, fontSize: 12 }}>{htmlUploadError}</div>}
        </div>

        {uiThemeLibrary.length > 0 && (
          <div className="admin-field">
            <label>Uploaded UI Themes</label>
            <div style={{ display: 'grid', gap: 8 }}>
              {uiThemeLibrary.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--admin-border)', padding: '8px 10px', borderRadius: 8 }}>
                  <span style={{ fontSize: 13 }}>{t.name} ({t.theme_type || 'react'})</span>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => removeUiTheme(t.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-field">
          <label>Primary</label>
          <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
          <input className="admin-input" value={primary} onChange={(e) => setPrimary(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Accent</label>
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
          <input className="admin-input" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Surface</label>
          <input type="color" value={surface} onChange={(e) => setSurface(e.target.value)} />
          <input className="admin-input" value={surface} onChange={(e) => setSurface(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Secondary</label>
          <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
          <input className="admin-input" value={secondary} onChange={(e) => setSecondary(e.target.value)} />
        </div>
        <div className="admin-field">
          <label>Primary Font (larger headings)</label>
          <select className="admin-input" value={primaryFont} onChange={(e) => setPrimaryFont(e.target.value)}>
            {fontOptions.map((f) => (
              <option key={f.family} value={f.family}>
                {f.family}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 12, color: 'var(--admin-muted)', marginTop: 4 }}>{fontStatus || `${fontOptions.length} fonts available`}</div>
        </div>

        <div className="admin-field">
          <label>Secondary Font (smaller/body text)</label>
          <select className="admin-input" value={secondaryFont} onChange={(e) => setSecondaryFont(e.target.value)}>
            {fontOptions.map((f) => (
              <option key={`secondary_${f.family}`} value={f.family}>
                {f.family}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-field">
          <label>Primary Text Scale ({primaryTextScale.toFixed(2)}x)</label>
          <input
            type="range"
            min={0.8}
            max={1.6}
            step={0.01}
            value={primaryTextScale}
            onChange={(e) => setPrimaryTextScale(Number(e.target.value))}
          />
        </div>

        <div className="admin-field">
          <label>Secondary Text Scale ({secondaryTextScale.toFixed(2)}x)</label>
          <input
            type="range"
            min={0.85}
            max={1.4}
            step={0.01}
            value={secondaryTextScale}
            onChange={(e) => setSecondaryTextScale(Number(e.target.value))}
          />
        </div>
        <div className="admin-field">
          <label>Button radius ({radius}px)</label>
          <input
            type="range"
            min={4}
            max={24}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={save}>
          Save Palette Tokens
        </button>{' '}
        <button type="button" className="admin-btn admin-btn-ghost" onClick={reset}>
          Reset to Default
        </button>
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Preview</h3>
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid var(--admin-border)',
            fontFamily: `"${secondaryFont}", system-ui, sans-serif`,
          }}
        >
          <div
            style={{
              height: 56,
              background: primary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              fontWeight: 700,
              fontFamily: `"${primaryFont}", system-ui, sans-serif`,
              fontSize: `${Math.round(20 * primaryTextScale)}px`,
            }}
          >
            Site header
          </div>
          <div style={{ padding: 16, background: surface }}>
            <div
              style={{
                height: 64,
                borderRadius: radius,
                background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                padding: 12,
                borderRadius: radius,
                border: '1px solid #ddd',
                background: '#fff',
              }}
            >
              <div style={{ fontWeight: 700 }}>Service name</div>
              <div style={{ color: accent, fontWeight: 700 }}>{formatCurrency(99)}</div>
              <button
                type="button"
                style={{
                  marginTop: 8,
                  width: '100%',
                  height: 40,
                  borderRadius: radius,
                  border: 'none',
                  background: accent,
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function normalizePalette(parsed) {
  if (!parsed || typeof parsed !== 'object') return null
  const src = parsed.tokens && typeof parsed.tokens === 'object' ? parsed.tokens : parsed
  const required = ['primary_color', 'accent_color', 'surface_color', 'secondary_color']
  if (!required.every((k) => typeof src[k] === 'string' && src[k])) return null
  return {
    id: parsed.id || `palette_${Date.now()}`,
    name: parsed.name || `Uploaded Palette ${new Date().toLocaleString()}`,
    primary_color: src.primary_color,
    accent_color: src.accent_color,
    surface_color: src.surface_color,
    secondary_color: src.secondary_color,
    font_family: src.font_family || src.primary_font_family || 'Syne',
    primary_font_family: src.primary_font_family || src.font_family || 'Syne',
    secondary_font_family: src.secondary_font_family || 'DM Sans',
    primary_text_scale: String(src.primary_text_scale || '1'),
    secondary_text_scale: String(src.secondary_text_scale || '1'),
    button_radius: String(src.button_radius || '10'),
  }
}
