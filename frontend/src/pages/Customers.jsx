import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customerApi'
import { getInvoices } from '../api/invoiceApi'

const DEMO_CUSTOMERS = [
  { id: 1, name: 'Aarav Mehta', email: 'aarav@example.com', phone: '+91 98765 43210', totalOrders: 12, totalSpent: 14200, tier: 'VIP', lastVisit: '2 days ago' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 91234 56789', totalOrders: 5, totalSpent: 4800, tier: 'Regular', lastVisit: '1 week ago' },
  { id: 3, name: 'Rohan Kapoor', email: 'rohan@example.com', phone: '+91 88001 11234', totalOrders: 28, totalSpent: 38500, tier: 'VIP', lastVisit: 'Today' },
  { id: 4, name: 'Nisha Patel', email: 'nisha@example.com', phone: '+91 70099 88765', totalOrders: 3, totalSpent: 2100, tier: 'New', lastVisit: '3 weeks ago' },
  { id: 5, name: 'Dev Bose', email: 'dev@example.com', phone: '+91 99887 76543', totalOrders: 9, totalSpent: 9900, tier: 'Regular', lastVisit: '4 days ago' },
  { id: 6, name: 'Sanya Iyer', email: 'sanya@example.com', phone: '+91 97001 23456', totalOrders: 17, totalSpent: 22400, tier: 'VIP', lastVisit: 'Yesterday' },
]

const EMPTY_FORM = { name: '', email: '', phone: '' }

const TIER_COLORS = {
  VIP: { bg: '#fef3c7', color: '#b1944c' },
  Regular: { bg: '#eff6ff', color: '#3b82f6' },
  New: { bg: '#f0fdf4', color: '#16a34a' },
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const paidOrderCount = customerOrders.filter((inv) => inv.status === 'PAID').length
  const draftOrderCount = customerOrders.filter((inv) => inv.status === 'PENDING').length
  const draftPendingAmount = customerOrders.reduce(
    (sum, inv) => inv.status === 'PENDING' ? sum + Number(inv.total || 0) : sum,
    0
  )

  useEffect(() => {
    getCustomers()
      .then(async (data) => {
        const customersList = (data.customers || []).map(customer => ({
          ...customer,
          tier: customer.tier || 'New',
          lastVisit: 'Recently'
        }))
        // enrich each customer with pending draft counts and amounts
        try {
          const enriched = await Promise.all(customersList.map(async (c) => {
            try {
              const invRes = await getInvoices({ customerId: c.id })
              const invoices = invRes.invoices || []
              const pendingDrafts = invoices.filter(i => i.status === 'PENDING').length
              const pendingAmount = invoices.reduce((s, i) => i.status === 'PENDING' ? s + Number(i.total || 0) : s, 0)
              const paidOrders = invoices.filter(i => i.status === 'PAID').length
              return { ...c, pendingDrafts, pendingAmount, paidOrders }
            } catch (e) {
              return { ...c, pendingDrafts: 0, pendingAmount: 0, paidOrders: c.totalOrders || 0 }
            }
          }))
          setCustomers(enriched)
        } catch (e) {
          setCustomers(customersList)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch customers:', error)
      })
  }, [])

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const openNew = () => {
    setEditingCustomer(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditingCustomer(c)
    setForm({ name: c.name, email: c.email, phone: c.phone })
    setShowModal(true)
  }

  const openDetails = async (c) => {
    setSelectedCustomer(c)
    setShowDetails(true)
    setOrdersLoading(true)
    try {
      const data = await getInvoices({ customerId: c.id })
      setCustomerOrders(data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch customer orders:', error)
      setCustomerOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCustomer(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) return
    setSaving(true)
    try {
      if (editingCustomer) {
        const resp = await updateCustomer(editingCustomer.id, form).catch(() => ({ customer: { ...editingCustomer, ...form } }))
        const updated = resp.customer || resp
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? updated : c)))
      } else {
        const resp = await createCustomer(form).catch(() => ({ customer: { id: Date.now(), ...form, totalOrders: 0, totalSpent: 0, tier: 'New', lastVisit: 'Just now' } }))
        const created = resp.customer || resp
        setCustomers((prev) => [...prev, created])
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this customer?')) return
    await deleteCustomer(id).catch(() => {})
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} registered customers.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="customers-grid">
        {filtered.length === 0 ? (
          <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No customers found.</p>
        ) : filtered.map((c) => {
          const tier = TIER_COLORS[c.tier] || TIER_COLORS.Regular
          return (
            <div key={c.id} className="customer-card">
              <div className="customer-card-top">
                <div className="customer-avatar">
                  {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="customer-info">
                  <button type="button" className="customer-name customer-link" onClick={() => openDetails(c)}>
                    {c.name}
                  </button>
                  <p className="customer-email">{c.email}</p>
                </div>
                <span className="tier-badge" style={{ background: tier.bg, color: tier.color }}>{c.tier}</span>
              </div>
                <div className="customer-stats">
                <div className="cstat">
                  <p className="cstat-label">Orders</p>
                  <p className="cstat-value">{typeof c.paidOrders !== 'undefined' ? c.paidOrders : c.totalOrders}</p>
                  {c.pendingDrafts > 0 && (
                    <small style={{ display: 'block', marginTop: 6, color: '#64748b', fontWeight: 600 }}>
                      {c.pendingDrafts} drafts · ₹{Number(c.pendingAmount || 0).toLocaleString('en-IN')}
                    </small>
                  )}
                </div>
                <div className="cstat">
                  <p className="cstat-label">Total Spent</p>
                  <p className="cstat-value">₹{Number(c.totalSpent).toLocaleString('en-IN')}</p>
                </div>
                <div className="cstat">
                  <p className="cstat-label">Last Visit</p>
                  <p className="cstat-value">{c.lastVisit}</p>
                </div>
              </div>
              <div className="customer-footer">
                <span className="customer-phone">{c.phone}</span>
                <div className="customer-actions">
                  <button className="icon-btn" onClick={() => openEdit(c)} title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(c.id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Aarav Mehta" />
              </div>
              <div className="form-field">
                <label className="form-label">Email Address</label>
                <input name="email" type="email" className="form-input" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} placeholder="customer@email.com" />
              </div>
              <div className="form-field">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} placeholder="+91 00000 00000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingCustomer ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetails && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Purchase history · {selectedCustomer.name}</h3>
              <button className="modal-close" onClick={() => setShowDetails(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, color: '#334155' }}>
                {ordersLoading ? `${selectedCustomer.totalOrders || 0} orders` : `${paidOrderCount} orders`}
                {draftOrderCount > 0 && (
                  <> · {draftOrderCount} drafts pending</>
                )}
                {' · '}₹{Number(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')} total spent
              </p>
              {!ordersLoading && draftOrderCount > 0 && (
                <p style={{ marginBottom: 16, color: '#64748b' }}>
                  ₹{draftPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} still pending payment
                </p>
              )}
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : customerOrders.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No purchase orders found for this customer.</p>
              ) : (
                <div className="order-list">
                  {customerOrders.map((inv) => (
                    <div key={inv.id} className="order-row">
                      <div>
                        <p className="order-number">{inv.invoiceNumber}</p>
                        <p className="order-meta">{new Date(inv.createdAt).toLocaleDateString()} · {inv.status}</p>
                      </div>
                      <p className="order-value">₹{Number(inv.total).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .search-wrapper { position: relative; width: 100%; max-width: 380px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .search-input { width: 100%; padding: 10px 16px 10px 40px; background: white; border: none; border-radius: 12px; font-size: 13px; font-family: 'Inter', sans-serif; color: #121927; box-shadow: 0 2px 8px rgba(0,0,0,0.05); outline: none; }
        .search-input:focus { box-shadow: 0 0 0 2px rgba(177,148,76,0.25); }
        .customers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .customer-card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
        .customer-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.08); }
        .customer-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .customer-avatar { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #1a2332, #4f5f7b); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; flex-shrink: 0; }
        .customer-info { flex: 1; min-width: 0; }
        .customer-name { font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 800; color: #121927; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .customer-link { background: none; border: none; padding: 0; text-align: left; width: 100%; cursor: pointer; }
        .customer-link:hover { color: #735b18; }
        .customer-email { font-size: 12px; color: #94a3b8; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tier-badge { padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
        .customer-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-bottom: 16px; background: #f8f9fa; border-radius: 12px; padding: 12px; }
        .cstat { text-align: center; }
        .cstat-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin: 0 0 4px; }
        .cstat-value { font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 800; color: #121927; margin: 0; }
        .customer-footer { display: flex; justify-content: space-between; align-items: center; }
        .customer-phone { font-size: 12px; color: #64748b; }
        .customer-actions { display: flex; gap: 8px; }
        .icon-btn { padding: 6px; border: none; background: #f1f5f9; border-radius: 8px; cursor: pointer; color: #64748b; display: flex; align-items: center; transition: all 0.15s; }
        .icon-btn:hover { background: #e2e8f0; color: #334155; }
        .icon-btn.danger:hover { background: #fff1f2; color: #f43f5e; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(18,25,39,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: white; border-radius: 20px; width: 100%; max-width: 460px; box-shadow: 0 24px 60px rgba(0,0,0,0.15); animation: slideUp 0.25s cubic-bezier(.22,1,.36,1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px 0; }
        .modal-title { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; color: #121927; }
        .modal-close { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; }
        .modal-close:hover { background: #f1f5f9; color: #334155; }
        .modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer { padding: 0 28px 24px; display: flex; justify-content: flex-end; gap: 12px; }
        .order-list { display: flex; flex-direction: column; gap: 12px; }
        .order-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; }
        .order-number { margin: 0 0 4px; font-weight: 700; color: #121927; }
        .order-meta { margin: 0; font-size: 12px; color: #64748b; }
        .order-value { margin: 0; font-weight: 800; color: #121927; }
      `}</style>
    </div>
  )
}
