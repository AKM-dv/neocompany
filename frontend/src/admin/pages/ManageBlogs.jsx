import { useEffect, useMemo, useRef, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import client from '../../api/client'
import '../AdminLayout.css'

const emptyForm = {
  title: '',
  slug: '',
  meta_description: '',
  excerpt: '',
  author_name: '',
  author_avatar_url: '',
  category: '',
  tags: '',
  featured_image_url: '',
  content: '',
  read_time_minutes: 5,
  is_featured: false,
  is_published: true,
  published_at: '',
}

export default function ManageBlogs() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)
  const [preview, setPreview] = useState(false)

  const load = async () => {
    const { data } = await client.get('/api/admin/blogs')
    setItems(data || [])
  }
  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((b) => (b.title || '').toLowerCase().includes(q) || (b.slug || '').toLowerCase().includes(q))
  }, [items, search])

  const openNew = () => setForm({ ...emptyForm })
  const openEdit = (b) => setForm({ ...b, tags: (b.tags || []).join(', ') })

  useEffect(() => {
    if (!form) return
    const nextSlug = slugify(form.title || '')
    if ((form.slug || '') === nextSlug) return
    setForm((f) => ({ ...f, slug: nextSlug }))
  }, [form?.title])

  const uploadImage = async (file, key) => {
    if (!file || !form) return
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await client.post('/api/admin/cms/upload', fd)
    setForm((f) => ({ ...f, [key]: data.url }))
  }

  const save = async (e) => {
    e.preventDefault()
    const body = {
      ...form,
      slug: slugify(form.title || form.slug || ''),
      tags: form.tags,
    }
    if (form.id) await client.put(`/api/admin/blogs/${form.id}`, body)
    else await client.post('/api/admin/blogs', body)
    setForm(null)
    setPreview(false)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete blog post?')) return
    await client.delete(`/api/admin/blogs/${id}`)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <input className="admin-input" style={{ width: 300 }} placeholder="Search blog by title or slug" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" className="admin-btn admin-btn-primary" onClick={openNew}>New Blog Post</button>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th><th>Slug</th><th>Category</th><th>Status</th><th>Published</th><th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td className="mono">{b.slug}</td>
                <td>{b.category || '—'}</td>
                <td>{b.is_published ? 'Published' : 'Draft'}</td>
                <td>{b.published_at ? new Date(b.published_at).toLocaleDateString() : '—'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEdit(b)}>Edit</button>{' '}
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => remove(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <>
          <button type="button" aria-label="Close" onClick={() => setForm(null)} style={{ position: 'fixed', inset: 0, border: 'none', background: 'rgba(0,0,0,.5)', zIndex: 130 }} />
          <div className="admin-card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(1100px,96vw)', maxHeight: '92vh', overflow: 'auto', zIndex: 140 }}>
            <button type="button" className="admin-modal-close" aria-label="Close modal" onClick={() => setForm(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>{form.id ? 'Edit Blog' : 'Create Blog'}</h2>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Publish Blog" full>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className={`admin-btn ${form.is_published ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                      onClick={() => setForm({ ...form, is_published: true })}
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      className={`admin-btn ${!form.is_published ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                      onClick={() => setForm({ ...form, is_published: false })}
                    >
                      Save as Draft
                    </button>
                    <span style={{ alignSelf: 'center', fontSize: 12, color: 'var(--admin-muted)' }}>
                      Current: {form.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Field>
                <Field label="Title"><input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
                <Field label="Slug (Auto generated)">
                  <input className="admin-input" value={form.slug || ''} readOnly />
                </Field>
                <Field label="Author"><input className="admin-input" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></Field>
                <Field label="Category"><input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
                <Field label="Tags (comma separated)" full><input className="admin-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
                <Field label="Meta Description" full><textarea className="admin-input" rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} /></Field>
                <Field label="Excerpt" full><textarea className="admin-input" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
                <Field label="Featured Image" full>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0], 'featured_image_url')} />
                    {form.featured_image_url ? <img src={form.featured_image_url} alt="" width={74} height={50} style={{ borderRadius: 8, objectFit: 'cover' }} /> : null}
                  </div>
                </Field>
                <Field label="Author Avatar" full>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0], 'author_avatar_url')} />
                    {form.author_avatar_url ? <img src={form.author_avatar_url} alt="" width={40} height={40} style={{ borderRadius: 999, objectFit: 'cover' }} /> : null}
                  </div>
                </Field>
                <Field label="Read Time (min)"><input className="admin-input" type="text" inputMode="numeric" value={form.read_time_minutes} onChange={(e) => setForm({ ...form, read_time_minutes: e.target.value })} /></Field>
                <Field label="Publish Date"><input className="admin-input" type="datetime-local" value={toLocalInputValue(form.published_at)} onChange={(e) => setForm({ ...form, published_at: e.target.value })} /></Field>
                <div className="admin-field" style={{ margin: 0 }}>
                  <label>Featured</label>
                  <div className="admin-toggle-row">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!form.is_featured}
                      aria-label={`Set featured ${form.is_featured ? 'off' : 'on'}`}
                      className={`admin-toggle ${form.is_featured ? 'on' : ''}`}
                      onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                    />
                    <span>{form.is_featured ? 'On' : 'Off'}</span>
                  </div>
                </div>
                <Field label="Main Content" full>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setPreview((v) => !v)}>{preview ? 'Editor Mode' : 'Preview Mode'}</button>
                  {preview ? (
                    <div className="cms-content" style={{ border: '1px solid var(--admin-border)', borderRadius: 8, padding: 12, background: '#fff' }} dangerouslySetInnerHTML={{ __html: form.content || '' }} />
                  ) : (
                    <Editor value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
                  )}
                </Field>
              </div>
              <div
                style={{
                  position: 'sticky',
                  bottom: -14,
                  marginTop: 14,
                  paddingTop: 10,
                  paddingBottom: 4,
                  borderTop: '1px solid var(--admin-border)',
                  background: 'var(--admin-surface)',
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  zIndex: 2,
                }}
              >
                <button type="submit" className="admin-btn admin-btn-ghost">Save Blog</button>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={async () => {
                    const body = {
                      ...form,
                      is_published: true,
                      slug: slugify(form.title || form.slug || ''),
                      tags: form.tags,
                    }
                    if (form.id) await client.put(`/api/admin/blogs/${form.id}`, body)
                    else await client.post('/api/admin/blogs', body)
                    setForm(null)
                    setPreview(false)
                    load()
                  }}
                >
                  Publish Blog
                </button>
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
      <style>{`
        .blog-editor .ql-toolbar.ql-snow{position:static;z-index:auto}
        .blog-editor .ql-container.ql-snow{min-height:260px !important;max-height:420px;overflow:auto}
      `}</style>
    </div>
  )
}

function Field({ label, children, full }) {
  return (
    <div className="admin-field" style={full ? { gridColumn: '1 / -1' } : undefined}>
      <label>{label}</label>
      {children}
    </div>
  )
}

function Editor({ value, onChange }) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    quillRef.current = new Quill(hostRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
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
        const fd = new FormData()
        fd.append('file', file)
        const { data } = await client.post('/api/admin/cms/upload', fd)
        const range = quillRef.current.getSelection(true)
        const idx = range ? range.index : quillRef.current.getLength()
        quillRef.current.insertEmbed(idx, 'image', data.url, 'user')
      }
    })
    quillRef.current.on('text-change', () => {
      onChangeRef.current?.(quillRef.current.root.innerHTML)
    })
    quillRef.current.root.innerHTML = value || ''
  }, [value])

  useEffect(() => {
    if (!quillRef.current) return
    if ((value || '') !== quillRef.current.root.innerHTML) quillRef.current.root.innerHTML = value || ''
  }, [value])

  return <div ref={hostRef} className="blog-editor" style={{ background: '#fff', color: '#111' }} />
}

function toLocalInputValue(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
  } catch {
    return ''
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}
