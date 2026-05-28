import { useState, useEffect } from 'react'
import { getDashboardStats, createInvoice } from '../api/invoiceApi'
import { getProducts } from '../api/productApi'
import { getCustomers } from '../api/customerApi'

const DEMO_STATS = {
  totalSKUs: 310,
  lowStockCount: 13,
  todaySales: 4600.0,
  pendingBills: 2,
  pendingAmount: 0,
}

const DEMO_INVENTORY = [
  { id: 1, sku: 'SKU-2094', name: 'Luxury Silk Pocket Square', category: 'Accessories', stock: 45, price: 120, status: 'IN STOCK' },
  { id: 2, sku: 'SKU-5521', name: 'Italian Calfskin Belt', category: 'Leather Goods', stock: 8, price: 210, status: 'LOW STOCK' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(DEMO_STATS)
  const [inventory, setInventory] = useState(DEMO_INVENTORY)
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const [billItems, setBillItems] = useState([])
  const [skuInput, setSkuInput] = useState('')
  const [qtyInput, setQtyInput] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [statRes, prodRes, custRes] = await Promise.all([
          getDashboardStats(),
          getProducts(),
          getCustomers(),
        ])
        setStats(statRes)
        if (prodRes.products?.length) {
          const withStatus = prodRes.products.map(p => ({
            ...p,
            price: parseFloat(p.price),
            status: p.stock <= 10 ? 'LOW STOCK' : 'IN STOCK'
          }))
          setInventory(withStatus)
        }
        if (custRes.customers?.length) {
          setCustomers(custRes.customers)
        }
      } catch (err) {
        console.error('Dashboard load failed', err)
      }
    }
    fetchData()
  }, [])

  const handleAddItem = () => {
    const product = inventory.find(p => p.sku && p.sku.toLowerCase() === skuInput.toLowerCase())
    if (!product) {
      setMessage('Product not found')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    const existing = billItems.find(i => i.id === product.id)
    if (existing) {
      setBillItems(billItems.map(i => i.id === product.id ? { ...i, qty: i.qty + parseInt(qtyInput) } : i))
    } else {
      setBillItems([...billItems, { ...product, qty: parseInt(qtyInput) }])
    }
    setSkuInput('')
    setQtyInput(1)
  }

  const removeFromBill = (id) => {
    setBillItems(billItems.filter(i => i.id !== id))
  }

  const subtotal = billItems.reduce((a, i) => a + (i.price * i.qty), 0)
  const total = subtotal + (subtotal * 0.18)

  const handleGenerateBill = async () => {
    if (!selectedCustomer || !selectedCustomer.id) {
      setMessage('Select a customer')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (billItems.length === 0) {
      setMessage('Add items to bill')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setProcessing(true)
    try {
      const payload = {
        customerId: selectedCustomer.id,
        items: billItems.map(i => ({ productId: i.id, sku: i.sku, name: i.name, quantity: i.qty, unitPrice: i.price })),
        paymentMethod: 'cash',
        discount: 0,
        notes: 'POS invoice',
        status: 'PAID',
      }
      const res = await createInvoice(payload)
      if (res.success) {
        setMessage(`Invoice ${res.invoice.invoiceNumber} created!`)
        setBillItems([])
        setTimeout(() => setMessage(''), 4000)
      } else {
        setMessage('Invoice creation failed')
      }
    } catch (err) {
      setMessage(err.message || 'Error creating invoice')
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!selectedCustomer || !selectedCustomer.id) {
      setMessage('Select a customer before saving draft')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    if (billItems.length === 0) {
      setMessage('Add items to bill before saving draft')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setProcessing(true)
    try {
      const payload = {
        customerId: selectedCustomer.id,
        items: billItems.map(i => ({ productId: i.id, sku: i.sku, name: i.name, quantity: i.qty, unitPrice: i.price })),
        paymentMethod: 'cash',
        discount: 0,
        notes: 'Draft order',
        status: 'PENDING',
      }
      const res = await createInvoice(payload)
      if (res.success) {
        setMessage(`Draft ${res.invoice.invoiceNumber} saved. Complete payment later.`)
        setBillItems([])
        setTimeout(() => setMessage(''), 4000)
      } else {
        setMessage('Draft save failed')
      }
    } catch (err) {
      setMessage(err.message || 'Error saving draft')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="page-root dashboard-page">
      <div className="page-header">
        <h2>Stock & Billing Hub</h2>
        <input type="text" placeholder="Global search..." className="search-box" />
        <div className="user-controls">
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">⚙️</button>
        </div>
      </div>

      {message && <div className="msg-banner">{message}</div>}

      <div className="stats-row">
        <article className="stat-card">
          <h4>Total SKUs</h4>
          <p>{stats.totalSKUs}</p>
          <small>↑ 112 NEW THIS MONTH</small>
        </article>
        <article className="stat-card low-stock">
          <h4>Low Stock Items</h4>
          <p>{stats.lowStockCount}</p>
          <small>! ACTION REQUIRED</small>
        </article>
        <article className="stat-card revenue">
          <h4>Today's Sales</h4>
          <p>₹{stats.todaySales.toLocaleString('en-IN')}</p>
          <small>LAST UPDATED 2M AGO</small>
        </article>
        <article className="stat-card pending">
          <h4>Pending Bills</h4>
          <p>{stats.pendingBills}</p>
          <small>₹{Number(stats.pendingAmount || 0).toLocaleString('en-IN')} pending</small>
        </article>
      </div>

      <div className="dashboard-main">
        <aside className="inventory-section">
          <div className="section-header">
            <h3>Live Inventory</h3>
            <span className="badge">Real-Time</span>
          </div>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Unit Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.slice(0, 6).map(p => (
                <tr key={p.id}>
                  <td className="sku">{p.sku}</td>
                  <td className="name">{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>₹{p.price.toLocaleString('en-IN')}</td>
                  <td><span className={`status ${p.status === 'IN STOCK' ? 'green' : 'amber'}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="/products" className="view-all">View All Inventory →</a>
        </aside>

        <section className="bill-section">
          <h3>New Bill</h3>
          <div className="bill-input-group">
            <input
              type="text"
              placeholder="Enter SKU or name..."
              value={skuInput}
              onChange={(e) => setSkuInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <input
              type="number"
              min="1"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              className="qty-input"
            />
            <button className="add-btn" onClick={handleAddItem}>Add Item</button>
          </div>

          <div className="bill-items">
            {billItems.length === 0 ? (
              <p className="empty">Add products above</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.price.toLocaleString('en-IN')}</td>
                      <td>₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                      <td>
                        <button
                          className="rm-btn"
                          onClick={() => removeFromBill(item.id)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <aside className="customer-section">
          <h3>Customer Details</h3>
          <div className="customer-input">
            <label>Customer Name</label>
            <select value={selectedCustomer?.id || ''} onChange={(e) => {
              const cust = customers.find(c => c.id === parseInt(e.target.value))
              setSelectedCustomer(cust || null)
            }}>
              <option value="">Select customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="customer-info">
              <p><strong>{selectedCustomer.name}</strong></p>
              <p>{selectedCustomer.phone}</p>
            </div>
          )}

          <div className="total-card">
            <p className="label">Total Payable Amount</p>
            <h2 className="amount">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
            <span className="currency">UBD</span>
            <button
              className="generate-btn"
              onClick={handleGenerateBill}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Generate & Print Bill'}
            </button>
            <button
              className="draft-btn"
              onClick={handleSaveDraft}
              disabled={processing}
            >
              Save Draft
            </button>
            <p className="draft-note">Drafts are saved as pending bills. Complete payment later to finalize.</p>
          </div>
        </aside>
      </div>

      <style>{`
        .dashboard-page { padding: 24px; }
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .page-header h2 { margin: 0; }
        .search-box { flex: 1; max-width: 300px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; }
        .user-controls { display: flex; gap: 8px; }
        .icon-btn { background: none; border: none; font-size: 18px; cursor: pointer; }
        .msg-banner { background: #d1fae5; color: #047857; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        .stat-card { background: white; border-left: 4px solid #cbd5e1; padding: 16px; border-radius: 12px; }
        .stat-card h4 { font-size: 10px; text-transform: uppercase; color: #64748b; margin: 0 0 8px; font-weight: 700; }
        .stat-card p { font-size: 28px; margin: 0; font-weight: 800; color: #1f2a44; }
        .stat-card small { font-size: 11px; color: #94a3b8; margin-top: 4px; display: block; }
        .stat-card.low-stock { border-left-color: #f43f5e; }
        .stat-card.revenue { border-left-color: #b1944c; }
        .stat-card.pending { border-left-color: #818cf8; }

        .dashboard-main { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

        .inventory-section, .bill-section, .customer-section { background: white; border-radius: 12px; padding: 16px; }

        .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .section-header h3 { margin: 0; font-size: 15px; }
        .badge { background: #fef3c7; color: #b1944c; padding: 2px 6px; border-radius: 6px; font-size: 9px; font-weight: 700; }

        .inventory-table { width: 100%; font-size: 12px; border-collapse: collapse; }
        .inventory-table th { font-weight: 700; text-align: left; padding: 8px 4px; border-bottom: 1px solid #f0f0f0; }
        .inventory-table td { padding: 10px 4px; border-bottom: 1px solid #f0f0f0; }
        .sku { font-weight: 700; color: #64748b; }
        .name { font-weight: 600; }
        .status { padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; }
        .status.green { background: #f0fdf4; color: #16a34a; }
        .status.amber { background: #fffbeb; color: #d97706; }
        .view-all { display: block; text-align: right; margin-top: 8px; font-size: 11px; color: #b1944c; text-decoration: none; font-weight: 700; }

        .bill-section h3, .customer-section h3 { margin-top: 0; }
        .bill-input-group { display: flex; gap: 8px; margin-bottom: 12px; }
        .bill-input-group input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
        .qty-input { max-width: 60px; }
        .add-btn { background: #b1944c; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 700; }
        .add-btn:hover { background: #9d7f3f; }

        .bill-items { margin-bottom: 12px; max-height: 200px; overflow-y: auto; }
        .bill-items table { width: 100%; font-size: 11px; }
        .bill-items th, .bill-items td { padding: 6px; text-align: left; border-bottom: 1px solid #f0f0f0; }
        .bill-items .rm-btn { background: none; border: none; color: #f43f5e; cursor: pointer; }
        .empty { text-align: center; color: #94a3b8; padding: 20px; }

        .customer-input { margin-bottom: 16px; }
        .customer-input label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 4px; }
        .customer-input select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
        .customer-info { padding: 12px; background: #f8f7f4; border-radius: 8px; margin-bottom: 12px; }
        .customer-info p { margin: 0; }

        .total-card { background: #1a2332; color: white; padding: 16px; border-radius: 10px; }
        .total-card .label { font-size: 10px; text-transform: uppercase; color: #8a9bb5; margin: 0; }
        .total-card .amount { font-size: 32px; margin: 4px 0; }
        .total-card .currency { font-size: 10px; color: #8a9bb5; }
        .generate-btn, .draft-btn { width: 100%; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; margin-top: 8px; }
        .generate-btn { background: #b1944c; color: white; }
        .generate-btn:hover { background: #9d7f3f; }
        .draft-btn { background: transparent; color: white; border: 1px solid #4f5f7b; }
        .draft-btn:hover { background: rgba(255,255,255,0.08); }
        .draft-note { margin: 10px 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.4; }
      `}</style>
    </div>
  )
}
