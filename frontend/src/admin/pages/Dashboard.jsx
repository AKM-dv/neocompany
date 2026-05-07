import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client'
import { notifyAdminToast } from '../adminToast'
import { useCMS } from '../../context/CMSContext'
import '../AdminLayout.css'
import {
  FiCalendar,
  FiClock,
  FiDollarSign,
  FiLayers,
  FiPlusCircle,
  FiTag,
  FiFileText,
} from 'react-icons/fi'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

export default function Dashboard() {
  const { formatCurrency } = useCMS()
  const [data, setData] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const loadDashboard = () => {
    client.get('/api/admin/dashboard').then((r) => setData(r.data))
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const statusData = useMemo(
    () =>
      Object.entries(data?.bookings_by_status || {}).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      })),
    [data?.bookings_by_status],
  )

  const serviceBars = useMemo(
    () =>
      (data?.top_services || []).map((s) => ({
        name: s.name.length > 16 ? `${s.name.slice(0, 16)}…` : s.name,
        fullName: s.name,
        count: s.count,
      })),
    [data?.top_services],
  )

  const trendData = useMemo(() => {
    const grouped = {}
    ;(data?.recent_bookings || []).forEach((b) => {
      const d = b.scheduled_date
      grouped[d] ||= { date: d.slice(5), bookings: 0, revenue: 0 }
      grouped[d].bookings += 1
      grouped[d].revenue += Number(b.total_amount || 0)
    })
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
  }, [data?.recent_bookings])

  if (!data) {
    return <div className="admin-card">Loading…</div>
  }

  const quickActions = [
    { to: '/admin/services', label: 'Add Service', desc: 'Create a new service listing', icon: FiPlusCircle },
    { to: '/admin/categories', label: 'Manage Categories', desc: 'Update service categories', icon: FiTag },
    { to: '/admin/cms', label: 'Edit CMS Pages', desc: 'Update About/Contact/Policies', icon: FiFileText },
  ]

  const pieColors = ['#E8622A', '#34D399', '#60A5FA', '#FBBF24', '#FB7185']

  const seedDemoData = async () => {
    setSeeding(true)
    try {
      const { data } = await client.post('/api/admin/demo/seed')
      notifyAdminToast(data?.message || 'Demo data loaded', 'success')
      loadDashboard()
    } catch (e) {
      notifyAdminToast(e?.response?.data?.error || 'Failed to seed demo data', 'error')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={seedDemoData} disabled={seeding}>
          {seeding ? 'Loading demo...' : 'Load Demo Data'}
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Bookings" value={data.total_bookings} icon={FiLayers} />
        <StatCard
          label="Pending"
          value={data.pending_bookings}
          pulse={data.pending_bookings > 0}
          icon={FiClock}
        />
        <StatCard label="Today's Bookings" value={data.today_bookings} icon={FiCalendar} />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(data.total_revenue)}
          mono
          icon={FiDollarSign}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {quickActions.map((q) => (
          <Link key={q.label} to={q.to} className="admin-card" style={{ textDecoration: 'none', color: 'inherit', borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <q.icon color="var(--admin-accent)" />
              <strong style={{ fontSize: 13 }}>{q.label}</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--admin-muted)' }}>{q.desc}</p>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Booking & Revenue Trend</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8622A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#E8622A" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                <XAxis dataKey="date" stroke="var(--admin-muted)" />
                <YAxis stroke="var(--admin-muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--admin-surface)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#E8622A"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  animationDuration={900}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#60A5FA"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Bookings by Status</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={92}
                  innerRadius={54}
                  paddingAngle={3}
                  animationDuration={900}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--admin-surface)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Top Services (Bookings)</h3>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={serviceBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
              <XAxis dataKey="name" stroke="var(--admin-muted)" />
              <YAxis stroke="var(--admin-muted)" />
              <Tooltip
                formatter={(value, _, item) => [value, item.payload.fullName]}
                contentStyle={{
                  background: 'var(--admin-surface)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="count" fill="#E8622A" radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-card admin-table-wrap" style={{ marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, fontFamily: "'Syne', sans-serif" }}>Recent Bookings</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Customer</th>
              <th>City</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_bookings.map((b) => (
              <tr key={b.booking_ref}>
                <td className="mono">{b.booking_ref}</td>
                <td>{b.guest_name}</td>
                <td>
                  {b.city_name} / {b.area_name}
                </td>
                <td>{b.scheduled_date}</td>
                <td>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </td>
                <td className="mono">{formatCurrency(b.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value, mono, pulse, icon: Icon }) {
  return (
    <div className="admin-card" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--admin-muted)' }}>
        {Icon ? <Icon aria-hidden /> : null}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 32,
          fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
          marginTop: 8,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
      {pulse && (
        <span
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--admin-accent)',
            animation: 'pulse 1.2s ease infinite',
          }}
        />
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }`}</style>
    </div>
  )
}
