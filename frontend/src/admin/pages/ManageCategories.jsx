import { useEffect, useMemo, useState } from 'react'
import client from '../../api/client'
import '../AdminLayout.css'

export default function ManageCategories() {
  const [rows, setRows] = useState([])
  const [drawer, setDrawer] = useState(null)
  const [services, setServices] = useState([])
  const [serviceQuery, setServiceQuery] = useState('')

  const load = async () => {
    const [cRes, sRes] = await Promise.all([
      client.get('/api/admin/categories'),
      client.get('/api/admin/services'),
    ])
    setRows(cRes.data || [])
    setServices(sRes.data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    const body = {
      name: drawer.name,
      description: drawer.description || '',
      image_url: drawer.image_url || '',
      priority: Number(drawer.priority || 0),
      service_ids: drawer.service_ids || [],
      is_active: drawer.is_active,
    }
    if (drawer.id) {
      await client.put(`/api/admin/categories/${drawer.id}`, body)
    } else {
      await client.post('/api/admin/categories', body)
    }
    setDrawer(null)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Delete category?')) return
    await client.delete(`/api/admin/categories/${id}`)
    load()
  }

  const toggle = async (row) => {
    await client.put(`/api/admin/categories/${row.id}`, {
      is_active: !row.is_active,
    })
    load()
  }

  const uploadImage = async (file) => {
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    const { data } = await client.post('/api/admin/cms/upload', body)
    setDrawer((d) => ({ ...d, image_url: data.url }))
  }

  const assignedServiceIds = drawer?.id
    ? services
        .filter((s) => Number(s.category_id) === Number(drawer.id))
        .map((s) => s.id)
    : []
  const selectedServiceIds = drawer
    ? (drawer.service_ids && drawer.service_ids.length ? drawer.service_ids : assignedServiceIds)
    : []
  const filteredServices = useMemo(() => {
    if (!serviceQuery.trim()) return services
    const needle = serviceQuery.toLowerCase()
    return services.filter((s) => {
      return (
        String(s.name || '').toLowerCase().includes(needle) ||
        String(s.category_name || '').toLowerCase().includes(needle)
      )
    })
  }, [services, serviceQuery])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() =>
            (setServiceQuery(''),
            setDrawer({
              id: null,
              name: '',
              description: '',
              image_url: '',
              priority: '',
              service_ids: [],
              is_active: true,
            }))
          }
        >
          Add New Category
        </button>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Image</th>
              <th>Priority</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td style={{ maxWidth: 280 }}>
                  {r.description || '—'}
                </td>
                <td>
                  {r.image_url ? (
                    <img src={r.image_url} alt="" width={44} height={44} style={{ objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="mono">
                  {r.priority ?? 0}
                </td>
                <td>
                  <div className="admin-toggle-row">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!!r.is_active}
                      aria-label={`Set ${r.name} ${r.is_active ? 'off' : 'on'}`}
                      className={`admin-toggle ${r.is_active ? 'on' : ''}`}
                      onClick={() => toggle(r)}
                    />
                    <span>{r.is_active ? 'On' : 'Off'}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={() => {
                      setServiceQuery('')
                      setDrawer({ ...r })
                    }}
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

      {drawer && (
        <>
          <button
            type="button"
            aria-label="Close"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,.45)',
              border: 'none',
              zIndex: 110,
            }}
            onClick={() => setDrawer(null)}
          />
          <div
            className="admin-card"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(980px, 96vw)',
              maxHeight: '92vh',
              overflow: 'auto',
              zIndex: 120,
              animation: 'modalIn 0.25s ease',
            }}
          >
            <button type="button" className="admin-modal-close" aria-label="Close modal" onClick={() => setDrawer(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>{drawer.id ? 'Edit' : 'New'} Category</h2>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'start' }}>
                <div>
                  <div className="admin-field">
                    <label>Name</label>
                    <input
                      className="admin-input"
                      value={drawer.name}
                      onChange={(e) => setDrawer({ ...drawer, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      className="admin-input"
                      rows={4}
                      value={drawer.description || ''}
                      onChange={(e) => setDrawer({ ...drawer, description: e.target.value })}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Category Image (upload only)</label>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ marginTop: 8 }}
                      onChange={(e) => uploadImage(e.target.files?.[0])}
                    />
                    {drawer.image_url && (
                      <div style={{ marginTop: 10 }}>
                        <img
                          src={drawer.image_url}
                          alt=""
                          width={92}
                          height={92}
                          style={{ borderRadius: 10, objectFit: 'cover', border: '1px solid var(--admin-border)' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="admin-field">
                    <label>Priority (lower appears first)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="admin-input"
                      value={drawer.priority ?? ''}
                      onChange={(e) =>
                        setDrawer({ ...drawer, priority: e.target.value })
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Active</label>
                    <div className="admin-toggle-row">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!!drawer.is_active}
                        aria-label={`Set category ${drawer.is_active ? 'inactive' : 'active'}`}
                        className={`admin-toggle ${drawer.is_active ? 'on' : ''}`}
                        onClick={() => setDrawer({ ...drawer, is_active: !drawer.is_active })}
                      />
                      <span>{drawer.is_active ? 'On' : 'Off'}</span>
                    </div>
                  </div>
                </div>
                <div className="admin-field" style={{ marginBottom: 0 }}>
                  <label>Optional: Add Existing Services</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <input
                      className="admin-input"
                      placeholder="Search service..."
                      style={{ maxWidth: 240 }}
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => setDrawer({ ...drawer, service_ids: filteredServices.map((s) => Number(s.id)) })}
                    >
                      Select Visible
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost"
                      onClick={() => setDrawer({ ...drawer, service_ids: [] })}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="category-service-grid">
                    {filteredServices.map((s) => {
                      const selected = selectedServiceIds.includes(Number(s.id))
                      const preview = s.image_url || (Array.isArray(s.image_urls) ? s.image_urls[0] : '')
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className={`category-service-card ${selected ? 'selected' : ''}`}
                          onClick={() => {
                            const next = selected
                              ? selectedServiceIds.filter((id) => Number(id) !== Number(s.id))
                              : [...selectedServiceIds, Number(s.id)]
                            setDrawer({ ...drawer, service_ids: next })
                          }}
                        >
                          <img src={preview || 'https://placehold.co/420x260?text=Service'} alt="" />
                          <div className="category-service-card-body">
                            <div className="category-service-card-name">{s.name}</div>
                            <div className="category-service-card-meta">{s.category_name || 'Unassigned'}</div>
                          </div>
                        </button>
                      )
                    })}
                    {!filteredServices.length && (
                      <div style={{ color: 'var(--admin-muted)', fontSize: 13 }}>No services found.</div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--admin-muted)' }}>
                    {selectedServiceIds.length} selected.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setDrawer(null)}
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
        .category-service-grid{
          border:1px solid var(--admin-border);
          border-radius:10px;
          padding:10px;
          max-height:420px;
          overflow:auto;
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:10px;
        }
        .category-service-card{
          border:1px solid var(--admin-border);
          border-radius:10px;
          overflow:hidden;
          padding:0;
          background:var(--admin-surface-2);
          color:var(--admin-text);
          text-align:left;
          transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease;
        }
        .category-service-card:hover{
          transform:translateY(-1px);
          border-color:color-mix(in srgb, var(--admin-accent) 40%, var(--admin-border));
        }
        .category-service-card.selected{
          border-color:var(--admin-accent);
          box-shadow:0 0 0 2px color-mix(in srgb, var(--admin-accent) 25%, transparent);
          background:color-mix(in srgb, var(--admin-accent) 8%, var(--admin-surface-2));
        }
        .category-service-card img{
          width:100%;
          height:92px;
          object-fit:cover;
          display:block;
          background:#fff;
        }
        .category-service-card-body{
          padding:8px;
          display:grid;
          gap:3px;
        }
        .category-service-card-name{
          font-size:13px;
          font-weight:700;
          line-height:1.3;
        }
        .category-service-card-meta{
          font-size:11px;
          color:var(--admin-muted);
        }
        @media (max-width: 900px){
          .category-service-grid{
            grid-template-columns:1fr;
            max-height:320px;
          }
        }
      `}</style>
    </div>
  )
}
