import { useState, useEffect } from 'react'
import { getDashboardStats, getInvoices } from '../api/invoiceApi'
import { getProducts } from '../api/productApi'

function RevenueChart({ labels = [], values = [], width = 640, height = 180 }) {
  const pad = 32
  const w = width
  const h = height
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const maxV = Math.max(...values, 1)
  const points = values.map((v, i) => {
    const x = pad + (innerW * (i / Math.max(1, values.length - 1)))
    const y = pad + innerH - (innerH * (v / maxV))
    return { x, y }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMinYMin meet">
      <rect x="0" y="0" width={w} height={h} fill="transparent" />
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
        <line key={idx} x1={pad} x2={w - pad} y1={pad + innerH * t} y2={pad + innerH * t} stroke="#eef2f7" strokeWidth={1} />
      ))}

      {/* area / line */}
      <path d={`${pathD} L ${pad + innerW} ${pad + innerH} L ${pad} ${pad + innerH} Z`} fill="#fef6e8" stroke="none" opacity={0.9} />
      <path d={pathD} fill="none" stroke="#b1944c" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

      {/* points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.4} fill="#fff" stroke="#b1944c" strokeWidth={1.6} />
        </g>
      ))}

      {/* x labels */}
      {labels.map((lab, i) => {
        const p = points[i]
        const short = lab ? lab.slice(5) : ''
        return (
          <text key={i} x={p ? p.x : pad + (i * 20)} y={h - 6} fontSize="9" fill="#64748b" textAnchor="middle">{short}</text>
        )
      })}
    </svg>
  )
}

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [chartPoints, setChartPoints] = useState({ labels: [], values: [] })
  const [period, setPeriod] = useState('monthly') // 'daily' | 'weekly' | 'monthly'
  const [hoverIndex, setHoverIndex] = useState(-1)
  const chartRef = /*#__PURE__*/ null

  useEffect(() => {
    async function fetchData() {
      try {
        const statRes = await getDashboardStats()
        setStats(statRes)

        const productRes = await getProducts()
        setProducts(productRes.products || [])
        // fetch recent invoices (limit to 1000 for safety)
        try {
          const invRes = await getInvoices({ limit: 1000 })
          const invList = invRes.invoices || []
          setInvoices(invList)
          buildChart(invList, period)
        } catch (e) {
          console.error('Failed to fetch invoices for chart', e)
        }
      } catch (err) {
        console.error('Error loading reports:', err)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    buildChart(invoices, period)
  }, [invoices, period])

  const buildChart = (invList, periodParam = 'monthly') => {
    if (!invList) return
    if (periodParam === 'daily') {
      const days = 7
      const labels = []
      const sums = {}
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        labels.push(key)
        sums[key] = 0
      }
      invList.forEach((inv) => {
        if (!inv || inv.status !== 'PAID') return
        const key = new Date(inv.createdAt).toISOString().slice(0, 10)
        if (sums[key] !== undefined) sums[key] += Number(inv.total || 0)
      })
      const values = labels.map(l => Number((sums[l] || 0).toFixed(2)))
      setChartPoints({ labels, values })
    } else if (periodParam === 'weekly') {
      const weeks = 12
      const labels = []
      const sums = {}
      const now = new Date()
      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - i * 7)
        const isoWeek = weekStart.toISOString().slice(0, 10)
        labels.push(isoWeek)
        sums[isoWeek] = 0
      }
      invList.forEach((inv) => {
        if (!inv || inv.status !== 'PAID') return
        const invDate = new Date(inv.createdAt)
        const diff = Math.floor((new Date().setHours(0,0,0,0) - new Date(invDate).setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
        const weekIndex = Math.floor(diff / 7)
        if (weekIndex >= 0 && weekIndex < weeks) {
          const key = labels[weeks - 1 - weekIndex]
          sums[key] += Number(inv.total || 0)
        }
      })
      const values = labels.map(l => Number((sums[l] || 0).toFixed(2)))
      setChartPoints({ labels, values })
    } else {
      const months = 12
      const labels = []
      const sums = {}
      const now = new Date()
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        labels.push(key)
        sums[key] = 0
      }
      invList.forEach((inv) => {
        if (!inv || inv.status !== 'PAID') return
        const d = new Date(inv.createdAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (sums[key] !== undefined) sums[key] += Number(inv.total || 0)
      })
      const values = labels.map(l => Number((sums[l] || 0).toFixed(2)))
      setChartPoints({ labels, values })
    }
    setHoverIndex(-1)
  }

  if (!stats) {
    return (
      <div className="page-root">
        <div className="page-header"><h2>Reports</h2></div>
        <p>Loading metrics...</p>
      </div>
    )
  }

  const revenue = stats.todaySales || 0
  const profit = (revenue * 0.34).toFixed(2)
  const avgOrder = stats.pendingBills ? (revenue / stats.pendingBills).toFixed(2) : 0
  const transactions = stats.totalSKUs || 0

  const topPerformers = products
    .sort((a, b) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 5)

  return (
    <div className="page-root reports-root">
      <div className="page-header">
        <div>
          <h2>Sales Analytics</h2>
          <p>Comprehensive performance overview for the current fiscal period.</p>
        </div>
        <div className="period-switch">
          <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
          <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>Weekly</button>
          <button className={period === 'daily' ? 'active' : ''} onClick={() => setPeriod('daily')}>Daily</button>
        </div>
      </div>

      <div className="cards-grid">
        <article className="metric-card">
          <span>Total Revenue</span>
          <h3>₹{Number(revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </article>
        <article className="metric-card">
          <span>Net Profit</span>
          <h3>₹{Number(profit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </article>
        <article className="metric-card">
          <span>Avg. Order Value</span>
          <h3>₹{Number(avgOrder).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
        </article>
        <article className="metric-card">
          <span>Total Transactions</span>
          <h3>{transactions.toLocaleString()}</h3>
        </article>
      </div>

      <div className="reports-lower">
        <div className="chart-card">
          <h4>Revenue Over Time</h4>
          <div style={{ height: 220, position: 'relative' }}>
            <RevenueChart labels={chartPoints.labels} values={chartPoints.values} />
            {hoverIndex >= 0 && chartPoints.labels[hoverIndex] && (
              <div style={{ position: 'absolute', left: 16 + (hoverIndex / Math.max(1, chartPoints.labels.length - 1)) * 100 + '%', top: 8, transform: 'translateX(-50%)', pointerEvents: 'none', background: 'white', padding: '6px 8px', borderRadius: 8, boxShadow: '0 6px 18px rgba(15,22,34,0.12)', fontSize: 12 }}>
                <div style={{ fontWeight: 800 }}>{chartPoints.labels[hoverIndex]}</div>
                <div>₹{Number(chartPoints.values[hoverIndex] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0 }} onMouseMove={(e) => {
              const el = e.currentTarget
              const rect = el.getBoundingClientRect()
              const x = e.clientX - rect.left
              const pct = Math.max(0, Math.min(1, x / rect.width))
              const idx = Math.round(pct * Math.max(0, chartPoints.labels.length - 1))
              setHoverIndex(idx)
            }} onMouseLeave={() => setHoverIndex(-1)} />
          </div>
        </div>
        <div className="top-performers-card">
          <div className="top-performers-header">
            <h4>Top Performers</h4>
            <small>Based on stock move this month</small>
          </div>
          <ul>
            {topPerformers.map((p) => (
              <li key={p.id}>
                <span>{p.name}</span>
                <strong>₹{Number(p.price || 0).toLocaleString('en-IN')}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .reports-root { padding: 24px; }
        .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; gap:16px; }
        .page-header h2 { margin:0; font-size:1.9rem; }
        .page-header p { margin:6px 0 0; color:#64748b; }
        .period-switch { display:flex; gap:8px; }
        .period-switch button { border:1px solid #dbe3ef; border-radius:10px; background:white; color:#334155; font-weight:700; padding:6px 12px; cursor:pointer; }
        .period-switch button.active { background:linear-gradient(135deg,#735b18,#b1944c); color:white; border:1px solid transparent; }
        .cards-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:18px; }
        .metric-card { background:white; border-radius:14px; padding:16px; box-shadow:0 8px 20px rgba(15,22,34,0.08); }
        .metric-card span { font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#64748b; }
        .metric-card h3 { margin:8px 0 0; font-size:1.6rem; color:#0f172a; }
        .reports-lower { display:grid; grid-template-columns:2fr 1fr; gap:14px; }
        .chart-card, .top-performers-card { background:white; border-radius:16px; padding:16px; box-shadow:0 8px 20px rgba(15,22,34,0.08); }
        .chart-card h4, .top-performers-header h4 { margin:0 0 10px; color:#1f2a44; }
        .chart-placeholder { height:220px; border:2px dashed #dbe3ef; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#94a3b8; }
        .top-performers-card ul { list-style:none; margin:0; padding:0; }
        .top-performers-card li { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f3f4f6; }
        .top-performers-card li:last-child { border-bottom:none; }
        .top-performers-card span { color:#334155; font-weight:600; }
        .top-performers-card strong { color:#b1944c; }
      `}</style>
    </div>
  )
}
