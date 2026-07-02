import { useState, useEffect } from 'react'
import { getInvoices, getSalesAnalytics } from '../api/invoiceApi'
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
  const [analytics, setAnalytics] = useState(null)
  const [products, setProducts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [chartPoints, setChartPoints] = useState({ labels: [], values: [] })
  const [period, setPeriod] = useState('monthly') // 'daily' | 'weekly' | 'monthly'
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const chartRef = /*#__PURE__*/ null

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [invRes, analyticsRes, productRes] = await Promise.all([
          getInvoices({ limit: 1000 }),
          getSalesAnalytics(),
          getProducts(),
        ])

        const invList = invRes.invoices || []
        setInvoices(invList)
        buildChart(invList, period)

        if (analyticsRes.success) {
          setAnalytics(analyticsRes.analytics)
        } else {
          setError(analyticsRes.message || 'Failed to load sales analytics')
        }

        setProducts(productRes.products || [])
      } catch (err) {
        console.error('Error loading reports:', err)
        setError(err.message || 'Error loading reports')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    buildChart(invoices, period)
  }, [invoices, period])

  const buildChart = (invList, periodParam = 'monthly') => {
    if (!invList || invList.length === 0) {
      setChartPoints({ labels: [], values: [] })
      return
    }

    const paidInvoices = invList.filter((inv) => inv && inv.status === 'PAID' && inv.createdAt)
    if (paidInvoices.length === 0) {
      setChartPoints({ labels: [], values: [] })
      return
    }

    const now = new Date()
    const invoiceDates = paidInvoices.map((inv) => new Date(inv.createdAt))
    const earliest = new Date(Math.min(...invoiceDates.map((d) => d.getTime())))
    const labels = []
    const sums = {}

    if (periodParam === 'daily') {
      const daysSpan = Math.max(7, Math.min(14, Math.ceil((now - earliest) / (1000 * 60 * 60 * 24)) + 1))
      for (let i = daysSpan - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        labels.push(key)
        sums[key] = 0
      }
      paidInvoices.forEach((inv) => {
        const key = new Date(inv.createdAt).toISOString().slice(0, 10)
        if (sums[key] !== undefined) sums[key] += Number(inv.total || 0)
      })
    } else if (periodParam === 'weekly') {
      const weeksSpan = Math.max(6, Math.min(14, Math.ceil((now - earliest) / (1000 * 60 * 60 * 24 * 7)) + 1))
      for (let i = weeksSpan - 1; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - i * 7)
        const key = `${weekStart.toISOString().slice(0, 10)}`
        labels.push(key)
        sums[key] = 0
      }
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      paidInvoices.forEach((inv) => {
        const invDate = new Date(inv.createdAt)
        invDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((todayStart.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24))
        const weekIndex = Math.floor(diffDays / 7)
        if (weekIndex >= 0 && weekIndex < weeksSpan) {
          const key = labels[weeksSpan - 1 - weekIndex]
          sums[key] += Number(inv.total || 0)
        }
      })
    } else {
      const monthsSpan = Math.max(6, Math.min(12, (now.getFullYear() - earliest.getFullYear()) * 12 + now.getMonth() - earliest.getMonth() + 1))
      for (let i = monthsSpan - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        labels.push(key)
        sums[key] = 0
      }
      paidInvoices.forEach((inv) => {
        const d = new Date(inv.createdAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (sums[key] !== undefined) sums[key] += Number(inv.total || 0)
      })
    }

    const values = labels.map((label) => Number((sums[label] || 0).toFixed(2)))
    setChartPoints({ labels, values })
    setHoverIndex(-1)
  }

  if (loading) {
    return (
      <div className="page-root">
        <div className="page-header"><h2>Reports</h2></div>
        <p>Loading sales analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-root">
        <div className="page-header"><h2>Reports</h2></div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">⚠ {error}</p>
        </div>
      </div>
    )
  }

  const summary = analytics?.summary || {}
  const revenue = summary.totalSales || 0
  const profit = (revenue * 0.34).toFixed(2)
  const avgOrder = summary.invoiceCount ? (revenue / summary.invoiceCount).toFixed(2) : 0
  const transactions = summary.invoiceCount || 0

  const topPerformers = analytics?.topProducts || []
  const topCustomers = analytics?.topCustomers || []
  const paymentBreakdown = analytics?.paymentBreakdown || []
  const tierAnalysis = analytics?.tierAnalysis || []
  const statusBreakdown = analytics?.statusBreakdown || []

  const formatCurrency = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

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
          <span>Total Sales</span>
          <h3>₹{formatCurrency(revenue)}</h3>
        </article>
        <article className="metric-card">
          <span>Total GST</span>
          <h3>₹{formatCurrency(summary.totalGST)}</h3>
        </article>
        <article className="metric-card">
          <span>Avg. Order Value</span>
          <h3>₹{formatCurrency(avgOrder)}</h3>
        </article>
        <article className="metric-card">
          <span>Total Invoices</span>
          <h3>{Number(transactions || 0).toLocaleString()}</h3>
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
                <div>₹{formatCurrency(chartPoints.values[hoverIndex])}</div>
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
            <h4>Top Selling Products</h4>
            <small>Based on invoice revenue</small>
          </div>
          <ul>
            {topPerformers.length > 0 ? (
              topPerformers.slice(0, 5).map((product, idx) => (
                <li key={idx}>
                  <span>{product.name}</span>
                  <strong>₹{formatCurrency(product.totalRevenue)}</strong>
                </li>
              ))
            ) : (
              <li>No top selling products yet</li>
            )}
          </ul>
        </div>
      </div>

      <div className="reports-secondary">
        <div className="top-customers-card">
          <div className="card-header">
            <h4>Top Customers</h4>
            <small>Highest invoice spend</small>
          </div>
          <ul>
            {topCustomers.length > 0 ? (
              topCustomers.slice(0, 5).map((customer, idx) => (
                <li key={idx}>
                  <div>
                    <strong>{customer.customerName}</strong>
                    <span>{customer.orderCount} invoice{customer.orderCount === 1 ? '' : 's'}</span>
                  </div>
                  <strong>₹{formatCurrency(customer.totalSpent)}</strong>
                </li>
              ))
            ) : (
              <li>No customer purchase data yet</li>
            )}
          </ul>
        </div>

        <div className="payment-breakdown-card">
          <div className="card-header">
            <h4>Payment Breakdown</h4>
            <small>Revenue by payment method</small>
          </div>
          <ul>
            {paymentBreakdown.length > 0 ? (
              paymentBreakdown.map((method, idx) => (
                <li key={idx}>
                  <span>{method.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                  <strong>₹{formatCurrency(method.revenue)} ({method.count})</strong>
                </li>
              ))
            ) : (
              <li>No payment method analytics yet</li>
            )}
          </ul>
          {tierAnalysis.length > 0 && (
            <div className="breakdown-footer">
              <h5>Customer Tiers</h5>
              <ul>
                {tierAnalysis.map((tier) => (
                  <li key={tier.tier}>
                    <span>{tier.tier}</span>
                    <strong>{tier.count} customer{tier.count === 1 ? '' : 's'}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {statusBreakdown.length > 0 && (
            <div className="breakdown-footer">
              <h5>Invoice Status</h5>
              <ul>
                {statusBreakdown.map((status) => (
                  <li key={status.status}>
                    <span>{status.status}</span>
                    <strong>{status.count} invoice{status.count === 1 ? '' : 's'}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
        .reports-secondary { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:18px; }
        .chart-card, .top-performers-card, .top-customers-card, .payment-breakdown-card { background:white; border-radius:16px; padding:16px; box-shadow:0 8px 20px rgba(15,22,34,0.08); }
        .chart-card h4, .top-performers-header h4, .card-header h4 { margin:0 0 10px; color:#1f2a44; }
        .card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:12px; }
        .card-header small { color:#64748b; }
        .top-performers-card ul, .top-customers-card ul, .payment-breakdown-card ul, .breakdown-footer ul { list-style:none; margin:0; padding:0; }
        .top-performers-card li, .top-customers-card li, .payment-breakdown-card li, .breakdown-footer li { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f3f4f6; }
        .top-performers-card li:last-child, .top-customers-card li:last-child, .payment-breakdown-card li:last-child, .breakdown-footer li:last-child { border-bottom:none; }
        .top-performers-card span, .top-customers-card div span, .payment-breakdown-card span, .breakdown-footer span { color:#334155; font-weight:600; }
        .top-performers-card strong, .top-customers-card strong, .payment-breakdown-card strong, .breakdown-footer strong { color:#b1944c; }
        .breakdown-footer { margin-top:14px; }
        .breakdown-footer h5 { margin:0 0 10px; font-size:0.95rem; color:#334155; }
      `}</style>
    </div>
  )
}
