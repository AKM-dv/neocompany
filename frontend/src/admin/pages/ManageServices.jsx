import { useEffect, useMemo, useRef, useState } from 'react'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import '../AdminLayout.css'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default function ManageServices() {
  const { formatCurrency } = useCMS()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [s, c] = await Promise.all([
      client.get('/api/admin/services'),
      client.get('/api/admin/categories'),
    ])
    setServices(s.data || [])
    setCategories(c.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return services.filter((x) => {
      if (catFilter && String(x.category_id) !== catFilter) return false
      if (!search.trim()) return true
      return x.name.toLowerCase().includes(search.toLowerCase())
    })
  }, [services, search, catFilter])

  const openNew = () =>
    setForm({
      id: null,
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: '',
      duration_minutes: 60,
      image_url: '',
      image_urls: [],
      is_active: true,
    })

  const openEdit = (row) =>
    setForm({
      id: row.id,
      name: row.name,
      category_id: row.category_id,
      description: row.description || '',
      price: row.price,
      duration_minutes: row.duration_minutes,
      image_url: row.image_url || '',
      image_urls: row.image_urls || (row.image_url ? [row.image_url] : []),
      is_active: !!row.is_active,
    })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      name: form.name,
      category_id: Number(form.category_id),
      description: form.description,
      price: Number(form.price),
      duration_minutes: Number(form.duration_minutes),
      image_url: form.image_url,
      image_urls: form.image_urls || [],
      is_active: form.is_active,
    }
    try {
      if (form.id) {
        await client.put(`/api/admin/services/${form.id}`, body)
      } else {
        await client.post('/api/admin/services', body)
      }
      setForm(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete service?')) return
    await client.delete(`/api/admin/services/${id}`)
    load()
  }

  const toggleActive = async (row) => {
    await client.put(`/api/admin/services/${row.id}`, {
      is_active: !row.is_active,
    })
    load()
  }

  const uploadImages = async (files) => {
    if (!files?.length || !form) return
    const current = form.image_urls || []
    const allowed = Math.max(0, 5 - current.length)
    const selected = Array.from(files).slice(0, allowed)
    const uploaded = []
    for (const file of selected) {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await client.post('/api/admin/cms/upload', fd)
      uploaded.push(data.url)
    }
    const next = [...current, ...uploaded].slice(0, 5)
    setForm((f) => ({
      ...f,
      image_urls: next,
      image_url: next[0] || '',
    }))
  }

  const removeImageAt = (idx) => {
    setForm((f) => {
      const next = (f.image_urls || []).filter((_, i) => i !== idx)
      return { ...f, image_urls: next, image_url: next[0] || '' }
    })
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            className="admin-input"
            style={{ width: 200 }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="admin-input"
            style={{ width: 220 }}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openNew}>
          Add New Service
        </button>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.image_url ? (
                    <img src={r.image_url} alt="" width={48} height={48} style={{ borderRadius: 8 }} />
                  ) : (
                    '—'
                  )}
                </td>
                <td>{r.name}</td>
                <td>{r.category_name}</td>
                <td className="mono">{formatCurrency(r.price)}</td>
                <td>{r.duration_minutes} min</td>
                <td>
                  <div className="admin-toggle-row">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!r.is_active}
                      aria-label={`Set ${r.name} ${r.is_active ? 'off' : 'on'}`}
                      className={`admin-toggle ${r.is_active ? 'on' : ''}`}
                      onClick={() => toggleActive(r)}
                    />
                    <span>{r.is_active ? 'On' : 'Off'}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => openEdit(r)}
                  >
                    Edit
                  </button>{' '}
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => remove(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setForm(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.48)',
              border: 'none',
              zIndex: 130,
            }}
          />
          <div
            className="admin-card service-modal"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(980px, 96vw)',
              maxHeight: '92vh',
              overflow: 'auto',
              zIndex: 140,
              animation: 'modalIn 0.25s ease',
            }}
          >
          <button type="button" className="admin-modal-close" aria-label="Close modal" onClick={() => setForm(null)}>×</button>
          <h2 style={{ marginTop: 0 }}>{form.id ? 'Edit Service' : 'New Service'}</h2>
          <form onSubmit={save}>
            <div
              className="service-form-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}
            >
              <div className="admin-field">
                <label>Name</label>
                <input
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Category</label>
                <select
                  className="admin-input"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm((f) => ({ ...f, description: html }))}
                />
              </div>
              <div className="admin-field">
                <label>Price</label>
                <input
                  className="admin-input"
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="admin-field">
                <label>Duration (minutes)</label>
                <input
                  className="admin-input"
                  type="text"
                  inputMode="numeric"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, duration_minutes: e.target.value })
                  }
                  required
                />
              </div>
              <div className="admin-field" style={{ gridColumn: '1 / -1' }}>
                <label>Service Images (max 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ marginTop: 4 }}
                  onChange={(e) => uploadImages(e.target.files)}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {(form.image_urls || []).map((url, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt=""
                        width={72}
                        height={72}
                        style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid var(--admin-border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          border: 'none',
                          background: 'var(--admin-danger)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-field">
                <label>Active</label>
                <div className="admin-toggle-row">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!form.is_active}
                    aria-label={`Set service ${form.is_active ? 'inactive' : 'active'}`}
                    className={`admin-toggle ${form.is_active ? 'on' : ''}`}
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  />
                  <span>{form.is_active ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save Service'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-ghost"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </>
      )}
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translate(-50%,-48%) scale(.98)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .service-quill .ql-toolbar.ql-snow{position:static;z-index:auto}
        .service-quill .ql-container.ql-snow{min-height:180px !important;max-height:260px;overflow:auto}
        .service-quill .ql-editor{min-height:150px}
      `}</style>
    </div>
  )
}

function RichTextEditor({ value, onChange }) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    quillRef.current = new Quill(hostRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote'],
          ['clean'],
        ],
      },
    })
    quillRef.current.on('text-change', () => {
      onChange(quillRef.current.root.innerHTML)
    })
    quillRef.current.root.innerHTML = value || ''
  }, [onChange, value])

  useEffect(() => {
    if (!quillRef.current) return
    if ((value || '') !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || ''
    }
  }, [value])

  return <div className="service-quill" ref={hostRef} style={{ background: '#fff', color: '#111' }} />
}
