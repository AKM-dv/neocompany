import { useEffect, useMemo, useRef, useState } from 'react'
import { useCMS } from '../../context/CMSContext'
import client from '../../api/client'
import { notifyAdminToast } from '../adminToast'
import '../AdminLayout.css'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const TABS = [
  { id: 'about', label: 'About Us', key: 'about_html' },
  { id: 'contact', label: 'Contact Us', key: 'contact_html', extra: true },
  { id: 'privacy', label: 'Privacy Policy', key: 'privacy_html' },
  { id: 'terms', label: 'Terms of Service', key: 'terms_html' },
  { id: 'refund', label: 'Refund Policy', key: 'refund_html' },
]

export default function CMSPages() {
  const { cms, refresh } = useCMS()
  const [tab, setTab] = useState('about')
  const [html, setHtml] = useState('')
  const [contactExtra, setContactExtra] = useState({
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    contact_map_embed: '',
  })

  const tabMeta = useMemo(() => TABS.find((t) => t.id === tab), [tab])

  useEffect(() => {
    if (!tabMeta) return
    setHtml(cms[tabMeta.key] || '')
    setContactExtra({
      contact_phone: cms.contact_phone || '',
      contact_email: cms.contact_email || '',
      contact_address: cms.contact_address || '',
      contact_map_embed: cms.contact_map_embed || '',
    })
  }, [tab, tabMeta, cms])

  const save = async () => {
    const payload = { [tabMeta.key]: html }
    if (tabMeta.extra) {
      Object.assign(payload, contactExtra)
    }
    await client.put('/api/admin/cms', payload)
    refresh()
  }

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="admin-btn admin-btn-ghost"
            style={{
              borderBottom: tab === t.id ? '2px solid var(--admin-accent)' : undefined,
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="admin-field">
        <label>Page HTML Content</label>
        <CMSRichTextEditor
          value={html}
          onChange={setHtml}
          onUploadError={(msg) => notifyAdminToast(msg, 'error')}
        />
      </div>
      {tab === 'contact' && (
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="admin-field">
            <label>Phone</label>
            <input
              className="admin-input"
              value={contactExtra.contact_phone}
              onChange={(e) =>
                setContactExtra({ ...contactExtra, contact_phone: e.target.value })
              }
            />
          </div>
          <div className="admin-field">
            <label>Email</label>
            <input
              className="admin-input"
              value={contactExtra.contact_email}
              onChange={(e) =>
                setContactExtra({ ...contactExtra, contact_email: e.target.value })
              }
            />
          </div>
          <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
            <label>Office address</label>
            <textarea
              className="admin-input"
              rows={2}
              value={contactExtra.contact_address}
              onChange={(e) =>
                setContactExtra({ ...contactExtra, contact_address: e.target.value })
              }
            />
          </div>
          <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
            <label>Google Maps embed HTML</label>
            <input
              className="admin-input"
              value={contactExtra.contact_map_embed}
              onChange={(e) =>
                setContactExtra({ ...contactExtra, contact_map_embed: e.target.value })
              }
            />
          </div>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <button type="button" className="admin-btn admin-btn-primary" onClick={save}>
          Save Page
        </button>
      </div>
      <style>{`
        .cms-quill .ql-toolbar.ql-snow{position:static;z-index:auto}
        .cms-quill .ql-container.ql-snow{min-height:360px !important;max-height:560px;overflow:auto}
        .cms-quill .ql-editor{min-height:320px}
      `}</style>
    </div>
  )
}

function CMSRichTextEditor({ value, onChange, onUploadError }) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const onUploadErrorRef = useRef(onUploadError)

  useEffect(() => {
    onChangeRef.current = onChange
    onUploadErrorRef.current = onUploadError
  }, [onChange, onUploadError])

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    quillRef.current = new Quill(hostRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'blockquote'],
          ['clean'],
        ],
      },
    })

    const toolbar = quillRef.current.getModule('toolbar')
    toolbar.addHandler('image', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        try {
          const fd = new FormData()
          fd.append('file', file)
          const { data } = await client.post('/api/admin/cms/upload', fd)
          const url = data?.url
          if (!url) {
            onUploadErrorRef.current?.('Image upload failed')
            return
          }
          const quill = quillRef.current
          const range = quill.getSelection(true)
          const index = range ? range.index : quill.getLength()
          quill.insertEmbed(index, 'image', url, 'user')
          quill.setSelection(index + 1, 0, 'silent')
          onChangeRef.current?.(quill.root.innerHTML)
        } catch {
          onUploadErrorRef.current?.('Image upload failed')
        }
      }
    })

    quillRef.current.on('text-change', () => {
      onChangeRef.current?.(quillRef.current.root.innerHTML)
    })
    quillRef.current.root.innerHTML = value || ''
  }, [value])

  useEffect(() => {
    if (!quillRef.current) return
    if ((value || '') !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || ''
    }
  }, [value])

  return <div className="cms-quill" ref={hostRef} style={{ background: '#fff', color: '#111' }} />
}
