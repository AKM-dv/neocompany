/**
 * Maps the active Color Palette (Theme Settings) onto admin UI CSS variables.
 */

export function getAdminThemeCssVars(activePalette, cms, mode) {
  const p = activePalette || {}
  const primary = p.primary_color || cms.primary_color || '#1A1A2E'
  const accent = p.accent_color || cms.accent_color || '#E8622A'
  const surface = p.surface_color || cms.surface_color || '#F7F5F0'
  const secondary = p.secondary_color || cms.secondary_color || '#16213E'
  const primaryFont = p.primary_font_family || cms.primary_font_family || cms.font_family || 'Syne'
  const secondaryFont = p.secondary_font_family || cms.secondary_font_family || 'DM Sans'
  const br = Math.max(6, Math.min(22, Number(p.button_radius || cms.button_radius || 10)))

  const vars = {
    '--admin-font-display': `"${primaryFont}", system-ui, sans-serif`,
    '--admin-font-body': `"${secondaryFont}", system-ui, sans-serif`,
    '--admin-radius': `${Math.max(6, br - 2)}px`,
    '--admin-radius-card': `${Math.min(22, br + 2)}px`,
    '--admin-accent': accent,
  }

  if (mode === 'dark') {
    return {
      ...vars,
      '--admin-bg': `color-mix(in srgb, ${primary} 92%, #020203)`,
      '--admin-surface': `color-mix(in srgb, ${primary} 78%, #12121c)`,
      '--admin-surface-2': `color-mix(in srgb, ${secondary} 52%, #151520)`,
      '--admin-border': `color-mix(in srgb, ${primary} 38%, #303042)`,
      '--admin-text': '#ececf4',
      '--admin-muted': `color-mix(in srgb, ${secondary} 48%, #9090a8)`,
      '--admin-login-bg': `radial-gradient(ellipse at top, color-mix(in srgb, ${primary} 62%, #1a1a28) 0%, color-mix(in srgb, ${primary} 88%, #000) 58%)`,
    }
  }

  return {
    ...vars,
    '--admin-bg': `color-mix(in srgb, ${surface} 68%, #eef1f8)`,
    '--admin-surface': '#ffffff',
    '--admin-surface-2': `color-mix(in srgb, ${surface} 78%, #ffffff)`,
    '--admin-border': `color-mix(in srgb, ${primary} 16%, #dfe3ec)`,
    '--admin-text': `color-mix(in srgb, ${primary} 90%, #0a0c10)`,
    '--admin-muted': `color-mix(in srgb, ${secondary} 38%, #5c6578)`,
    '--admin-login-bg': `radial-gradient(ellipse at top, color-mix(in srgb, ${surface} 92%, white) 0%, color-mix(in srgb, ${primary} 10%, #f0f2f8) 55%)`,
  }
}
