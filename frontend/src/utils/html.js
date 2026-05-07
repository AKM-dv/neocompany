/**
 * Turn HTML (e.g. Quill/CMS output) into plain text for previews and cards.
 */
export function htmlToPlainText(html) {
  if (!html) return ''
  const s = String(html)
  if (typeof document !== 'undefined') {
    const d = document.createElement('div')
    d.innerHTML = s
    const t = d.textContent || d.innerText || ''
    return t.replace(/\s+/g, ' ').trim()
  }
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export function excerptPlain(html, maxLen = 120) {
  const plain = htmlToPlainText(html)
  if (plain.length <= maxLen) return plain
  return `${plain.slice(0, maxLen)}…`
}
