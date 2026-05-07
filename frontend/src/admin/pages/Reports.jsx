import { useEffect, useMemo, useState } from 'react'
import client from '../../api/client'
import { useCMS } from '../../context/CMSContext'
import '../AdminLayout.css'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function Reports() {
  const { formatCurrency } = useCMS()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await client.get('/api/admin/reports', {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      setData(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const statusData = useMemo(
    () =>
      Object.entries(data?.bookings_by_status || {}).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      })),
    [data?.bookings_by_status],
  )

  const exportData = async (kind, format) => {
    const res = await client.get('/api/admin/export', {
      params: {
        kind,
        format,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      },
      responseType: format === 'csv' ? 'blob' : 'json',
    })
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      downloadBlob(blob, `${kind}_export.json`)
      return
    }
    downloadBlob(res.data, `${kind}_export.csv`)
  }

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Reports & Export</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>Start Date</label>
            <input className="admin-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label>End Date</label>
            <input className="admin-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button type="button" className="admin-btn admin-btn-primary" onClick={load} disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filter'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => { setStartDate(''); setEndDate(''); }}>
            Clear
          </button>
        </div>
      </div>

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
            <Kpi label="Total Bookings" value={data.summary.total_bookings} />
            <Kpi label="Total Revenue" value={formatCurrency(data.summary.total_revenue)} />
            <Kpi label="Avg Order Value" value={formatCurrency(data.summary.avg_order_value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>Bookings & Revenue Trend</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={data.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis dataKey="date" stroke="var(--admin-muted)" />
                    <YAxis stroke="var(--admin-muted)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="#E8622A" fill="#E8622A33" />
                    <Area type="monotone" dataKey="revenue" stroke="#60A5FA" fill="#60A5FA2b" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>Bookings by Status</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={['#E8622A', '#34D399', '#60A5FA', '#FBBF24', '#FB7185'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>Top Services</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={data.top_services || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis dataKey="name" stroke="var(--admin-muted)" />
                    <YAxis stroke="var(--admin-muted)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#E8622A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-card">
              <h3 style={{ marginTop: 0 }}>Bookings by City</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={data.bookings_by_city || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                    <XAxis dataKey="city" stroke="var(--admin-muted)" />
                    <YAxis stroke="var(--admin-muted)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#60A5FA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ marginTop: 0 }}>Data Export</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <ExportRow label="Bookings" onCsv={() => exportData('bookings', 'csv')} onJson={() => exportData('bookings', 'json')} />
              <ExportRow label="Services" onCsv={() => exportData('services', 'csv')} onJson={() => exportData('services', 'json')} />
              <ExportRow label="Customers Summary" onCsv={() => exportData('customers', 'csv')} onJson={() => exportData('customers', 'json')} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({ label, value }) {
  return (
    <div className="admin-card">
      <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function ExportRow({ label, onCsv, onJson }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--admin-border)', borderRadius: 8, padding: '10px 12px' }}>
      <strong style={{ fontSize: 14 }}>{label}</strong>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={onJson}>
          Export JSON
        </button>
        <button type="button" className="admin-btn admin-btn-primary" onClick={onCsv}>
          Export CSV
        </button>
      </div>
    </div>
  )
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
