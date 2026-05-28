import { useState, useEffect } from 'react'
import { createInvoice, getInvoices } from '../api/invoiceApi'
import { getProducts } from '../api/productApi'
import { getCustomers } from '../api/customerApi'

const DEMO_PRODUCTS = [
  { id: 1, sku: 'ACC-042', name: 'Heritage Leather Bag', price: 245, category: 'ACCESSORIES' },
  { id: 2, sku: 'TIM-011', name: 'Lunar Chronograph', price: 189, category: 'ACCESSORIES' },
  { id: 3, sku: 'APR-007', name: 'Merino Turtleneck', price: 185, category: 'APPAREL' },
  { id: 4, sku: 'APR-015', name: 'Slim Fit Oxford Shirt', price: 145, category: 'APPAREL' },
  { id: 5, sku: 'LTH-003', name: 'Italian Calfskin Belt', price: 210, category: 'LEATHER GOODS' },
  { id: 6, sku: 'ACC-031', name: 'Silk Pocket Square', price: 120, category: 'ACCESSORIES' },
  { id: 7, sku: 'APR-022', name: 'Cashmere Scarf', price: 165, category: 'APPAREL' },
  { id: 8, sku: 'LTH-009', name: 'Suede Chelsea Boots', price: 310, category: 'FOOTWEAR' },
]

const DEMO_CUSTOMERS = [
  { id: 1, name: 'Aarav Mehta', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Sharma', phone: '+91 91234 56789' },
  { id: 3, name: 'Rohan Kapoor', phone: '+91 88001 11234' },
  { id: 4, name: 'Nisha Patel', phone: '+91 70099 88765' },
]

const DEMO_RECENT = [
  { id: 'INV-0041', customer: 'Aarav Mehta', items: 3, total: 460.0, status: 'PAID', date: 'Today, 3:12 PM' },
  { id: 'INV-0040', customer: 'Priya Sharma', items: 1, total: 120.0, status: 'PAID', date: 'Today, 2:45 PM' },
  { id: 'INV-0039', customer: 'Rohan Kapoor', items: 5, total: 895.0, status: 'PENDING', date: 'Today, 1:30 PM' },
  { id: 'INV-0038', customer: 'Nisha Patel', items: 2, total: 330.0, status: 'PAID', date: 'Yesterday' },
  { id: 'INV-0037', customer: 'Dev Bose', items: 4, total: 740.0, status: 'PAID', date: 'Yesterday' },
]

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> },
  { id: 'card', label: 'Card', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: 'upi', label: 'UPI', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
]

export default function Billing() {
  const [catalog, setCatalog] = useState(DEMO_PRODUCTS)
  const [customers, setCustomers] = useState(DEMO_CUSTOMERS)
  const [recentInvoices, setRecentInvoices] = useState(DEMO_RECENT)

  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [catalogSearch, setCatalogSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [processing, setProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    Promise.all([getProducts(), getCustomers(), getInvoices()])
      .then(([p, c, inv]) => {
        // Extract products array and add status
        if (p?.products?.length) {
          const products = p.products.map(product => ({
            ...product,
            price: parseFloat(product.price)
          }))
          setCatalog(products)
        }
        // Extract customers array
        if (c?.customers?.length) {
          setCustomers(c.customers)
        }
        // Extract invoices array
        if (inv?.invoices?.length) {
          setRecentInvoices(inv.invoices)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch billing data:', error)
      })
  }, [])

  const categories = ['ALL', ...new Set(catalog.map((p) => p.category))]

  const filteredCatalog = catalog.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.sku.toLowerCase().includes(catalogSearch.toLowerCase())
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory
    return matchSearch && matchCat
  })

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)
  )

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => { setCart([]); setSelectedCustomer(null) }

  const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0)
  const discount = selectedCustomer ? subtotal * 0.1 : 0
  const tax = (subtotal - discount) * 0.05
  const total = subtotal - discount + tax
  const draftCount = recentInvoices.filter((inv) => inv.status === 'PENDING').length
  const draftPendingAmount = recentInvoices.reduce((sum, inv) => inv.status === 'PENDING' ? sum + Number(inv.total || 0) : sum, 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    if (!selectedCustomer || !selectedCustomer.id) {
      setSuccessMsg('Please select a customer before generating invoice.')
      setTimeout(() => setSuccessMsg(''), 4000)
      return
    }

    setProcessing(true)
    try {
      const invoiceData = {
        customerId: selectedCustomer.id,
        items: cart.map((i) => ({ productId: i.id, sku: i.sku, name: i.name, quantity: i.qty, unitPrice: i.price })),
        paymentMethod,
        discount,
        notes: `POS invoice for ${selectedCustomer.name}`,
        status: 'PAID',
      }

      const response = await createInvoice(invoiceData)
      if (!response?.success) {
        throw new Error(response?.message || 'Unable to create invoice')
      }

      const created = response.invoice
      setRecentInvoices((prev) => [
        {
          id: created.invoiceNumber || created.id,
          customer: created.customerName,
          items: created.items?.length ?? cart.length,
          total: created.total,
          status: created.status,
          date: new Date(created.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ])

      setCatalog((prev) => prev.map((product) => {
        const orderItem = cart.find((i) => i.id === product.id)
        if (!orderItem) return product
        return {
          ...product,
          stock: Math.max(0, (product.stock || 0) - orderItem.qty),
        }
      }))

      setSuccessMsg(`Invoice ${created.invoiceNumber || created.id} created successfully!`)
      clearCart()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (error) {
      console.error('Invoice creation failed', error)
      setSuccessMsg(error.message || 'Invoice creation failed. Please try again.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (cart.length === 0) return
    if (!selectedCustomer || !selectedCustomer.id) {
      setSuccessMsg('Select a customer before saving draft.')
      setTimeout(() => setSuccessMsg(''), 4000)
      return
    }

    setProcessing(true)
    try {
      const invoiceData = {
        customerId: selectedCustomer.id,
        items: cart.map((i) => ({ productId: i.id, sku: i.sku, name: i.name, quantity: i.qty, unitPrice: i.price })),
        paymentMethod,
        discount,
        notes: `Draft order for ${selectedCustomer.name}`,
        status: 'PENDING',
      }

      const response = await createInvoice(invoiceData)
      if (!response?.success) {
        throw new Error(response?.message || 'Unable to save draft')
      }

      const created = response.invoice
      setRecentInvoices((prev) => [
        {
          id: created.invoiceNumber || created.id,
          customer: created.customerName,
          items: created.items?.length ?? cart.length,
          total: created.total,
          status: created.status,
          date: new Date(created.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev.slice(0, 4),
      ])

      setSuccessMsg(`Draft ${created.invoiceNumber || created.id} saved. Pay later to finalize.`)
      clearCart()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (error) {
      console.error('Draft save failed', error)
      setSuccessMsg(error.message || 'Draft save failed. Please try again.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h2 className="page-title">Billing &amp; POS</h2>
          <p className="page-subtitle">Station ID: #042-NORTH · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {successMsg && (
        <div className="success-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {successMsg}
        </div>
      )}

      <div className="billing-layout">
        {/* LEFT: Catalog + Cart */}
        <div className="billing-left">
          {/* Catalog */}
          <div className="data-card">
            <div className="data-card-header">
              <h4 className="data-card-title">Product Catalog</h4>
              <div className="cat-filters">
                {categories.map((cat) => (
                  <button key={cat} className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-wrapper" style={{ marginBottom: 16 }}>
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Search by name or SKU..." value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
            </div>
            <div className="catalog-grid">
              {filteredCatalog.map((p) => (
                <button key={p.id} className="catalog-item" onClick={() => addToCart(p)}>
                  <div className="catalog-item-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b1944c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                  <p className="catalog-item-name">{p.name}</p>
                  <p className="catalog-item-sku">{p.sku}</p>
                  <p className="catalog-item-price">₹{p.price.toLocaleString('en-IN')}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="data-card">
            <div className="data-card-header">
              <h4 className="data-card-title">
                Cart
                {cart.length > 0 && <span className="cart-count">{cart.reduce((a, i) => a + i.qty, 0)} items</span>}
              </h4>
              {cart.length > 0 && <button className="clear-btn" onClick={clearCart}>Clear Cart</button>}
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d0c5b4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <p>Add products from the catalog above.</p>
              </div>
            ) : (
              <div className="cart-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-row">
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.name}</p>
                      <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')} each</p>
                    </div>
                    <div className="cart-qty-ctrl">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <p className="cart-row-total">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                    <button className="remove-btn" onClick={() => removeItem(item.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Summary + Customer + Payment */}
        <div className="billing-right">
          {/* Customer Selection */}
          <div className="data-card">
            <h4 className="data-card-title" style={{ marginBottom: 14 }}>Customer</h4>
            <div className="search-wrapper" style={{ marginBottom: 12 }}>
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="search-input" placeholder="Search customer..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
            </div>
            {selectedCustomer ? (
              <div className="selected-customer">
                <div className="cust-avatar">{selectedCustomer.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                <div>
                  <p className="cust-name">{selectedCustomer.name}</p>
                  <p className="cust-phone">{selectedCustomer.phone}</p>
                  <p className="cust-discount">VIP 10% discount applied</p>
                </div>
                <button className="clear-btn" onClick={() => { setSelectedCustomer(null); setCustomerSearch('') }}>Change</button>
              </div>
            ) : (
              <div className="customer-dropdown">
                {filteredCustomers.slice(0, 4).map((c) => (
                  <button key={c.id} className="customer-option" onClick={() => { setSelectedCustomer(c); setCustomerSearch('') }}>
                    <div className="cust-opt-avatar">{c.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                    <div>
                      <p className="cust-opt-name">{c.name}</p>
                      <p className="cust-opt-phone">{c.phone}</p>
                    </div>
                  </button>
                ))}
                <button className="customer-option walk-in" onClick={() => { setSelectedCustomer({ id: null, name: 'Walk-in Customer', phone: '—' }); setCustomerSearch('') }}>
                  <div className="cust-opt-avatar" style={{ background: '#f1f5f9', color: '#64748b' }}>?</div>
                  <div><p className="cust-opt-name">Walk-in Customer</p><p className="cust-opt-phone">No account</p></div>
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="data-card">
            <h4 className="data-card-title" style={{ marginBottom: 16 }}>Order Summary</h4>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              {discount > 0 && <div className="summary-row discount"><span>VIP Discount (10%)</span><span>−₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
              <div className="summary-row"><span>GST (5%)</span><span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              <div className="summary-divider" />
              <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="data-card">
            <h4 className="data-card-title" style={{ marginBottom: 14 }}>Payment Method</h4>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} className={`payment-method-btn ${paymentMethod === m.id ? 'active' : ''}`} onClick={() => setPaymentMethod(m.id)}>
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="checkout-btn" onClick={handleCheckout} disabled={cart.length === 0 || processing}>
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" /> Processing…
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    Generate Invoice · ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </>
                )}
              </button>
              <button className="draft-btn" onClick={handleSaveDraft} disabled={cart.length === 0 || processing}>
                Save Draft
              </button>
              <p className="draft-note">Drafts are saved as pending invoices. Complete payment later to finalize and update inventory.</p>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="data-card">
            <h4 className="data-card-title" style={{ marginBottom: 14 }}>Recent Invoices</h4>
            {draftCount > 0 && (
              <div className="draft-summary">
                <strong>{draftCount} drafts</strong> · ₹{draftPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} pending payment
              </div>
            )}
            <div className="recent-invoices">
              {recentInvoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="recent-inv-row">
                  <div>
                    <p className="inv-id">{inv.id}</p>
                    <p className="inv-meta">{inv.customer} · {inv.items} items · {inv.date}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="inv-total">₹{Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <span className={`status-chip ${inv.status === 'PAID' ? 'status-green' : 'status-amber'}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .billing-layout { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
        .billing-left { display: flex; flex-direction: column; gap: 20px; }
        .billing-right { display: flex; flex-direction: column; gap: 16px; }
        .success-banner { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: #f0fdf4; border-radius: 12px; color: #16a34a; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .cat-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .cat-btn { padding: 5px 12px; border: none; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #f1f5f9; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .cat-btn.active { background: linear-gradient(135deg, #735b18, #b1944c); color: white; }
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .search-input { width: 100%; padding: 10px 16px 10px 40px; background: #f8f7f4; border: none; border-radius: 10px; font-size: 13px; font-family: 'Inter', sans-serif; color: #121927; outline: none; box-sizing: border-box; }
        .search-input:focus { box-shadow: 0 0 0 2px rgba(177,148,76,0.25); }
        .catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
        .catalog-item { background: #f8f7f4; border: none; border-radius: 12px; padding: 14px 12px; cursor: pointer; text-align: left; transition: all 0.2s; }
        .catalog-item:hover { background: #fef3c7; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(177,148,76,0.15); }
        .catalog-item-icon { width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .catalog-item-name { font-size: 12px; font-weight: 700; color: #121927; margin: 0 0 3px; line-height: 1.3; }
        .catalog-item-sku { font-size: 10px; color: #94a3b8; margin: 0 0 6px; }
        .catalog-item-price { font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; color: #b1944c; margin: 0; }
        .cart-count { font-size: 10px; padding: 2px 8px; background: #fef3c7; color: #b1944c; border-radius: 20px; font-weight: 700; }
        .clear-btn { font-size: 11px; font-weight: 700; color: #94a3b8; background: none; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; }
        .clear-btn:hover { color: #f43f5e; }
        .cart-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px; color: #94a3b8; font-size: 13px; }
        .cart-list { display: flex; flex-direction: column; gap: 2px; }
        .cart-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
        .cart-row:last-child { border-bottom: none; }
        .cart-item-info { flex: 1; }
        .cart-item-name { font-size: 13px; font-weight: 700; color: #121927; margin: 0 0 3px; }
        .cart-item-price { font-size: 11px; color: #94a3b8; margin: 0; }
        .cart-qty-ctrl { display: flex; align-items: center; gap: 8px; }
        .qty-btn { width: 28px; height: 28px; border: none; background: #f1f5f9; border-radius: 8px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #334155; transition: background 0.15s; }
        .qty-btn:hover { background: #e2e8f0; }
        .qty-val { font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; color: #121927; min-width: 20px; text-align: center; }
        .cart-row-total { font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; color: #121927; min-width: 80px; text-align: right; }
        .remove-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; transition: color 0.15s; }
        .remove-btn:hover { color: #f43f5e; }
        .selected-customer { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f7f4; border-radius: 12px; }
        .cust-avatar { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #1a2332, #4f5f7b); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; flex-shrink: 0; }
        .cust-name { font-size: 13px; font-weight: 700; color: #121927; margin: 0 0 2px; }
        .cust-phone { font-size: 11px; color: #94a3b8; margin: 0 0 2px; }
        .cust-discount { font-size: 10px; font-weight: 700; color: #16a34a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
        .customer-dropdown { display: flex; flex-direction: column; gap: 4px; }
        .customer-option { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: none; border: none; border-radius: 10px; cursor: pointer; text-align: left; transition: background 0.15s; width: 100%; }
        .customer-option:hover { background: #f8f7f4; }
        .cust-opt-avatar { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #1a2332, #4f5f7b); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; }
        .cust-opt-name { font-size: 13px; font-weight: 700; color: #121927; margin: 0 0 1px; }
        .cust-opt-phone { font-size: 11px; color: #94a3b8; margin: 0; }
        .summary-rows { display: flex; flex-direction: column; gap: 10px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; }
        .summary-row.discount { color: #16a34a; font-weight: 600; }
        .summary-row.total { font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 900; color: #121927; }
        .summary-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }
        .payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px; }
        .payment-method-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border: 2px solid #f1f5f9; border-radius: 12px; background: white; cursor: pointer; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.2s; }
        .payment-method-btn.active { border-color: #b1944c; background: #fef3c7; color: #b1944c; }
        .payment-method-btn:hover:not(.active) { border-color: #e2e8f0; background: #f8f9fa; }
        .checkout-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #735b18, #b1944c); border: none; border-radius: 14px; color: white; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s; }
        .checkout-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(115,91,24,0.3); }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .draft-btn { width: 100%; padding: 16px; border: 1px solid #c6b484; border-radius: 14px; background: white; color: #5c4b20; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .draft-btn:hover:not(:disabled) { background: #f8f3de; transform: translateY(-1px); }
        .draft-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .draft-note { margin: 0; font-size: 12px; color: #7c6f44; line-height: 1.4; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .recent-invoices { display: flex; flex-direction: column; gap: 10px; }
        .draft-summary { margin-bottom: 10px; padding: 12px 14px; border-radius: 12px; background: #f8f7f4; color: #334155; font-size: 13px; font-weight: 700; }
        .recent-inv-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f8fafc; }
        .recent-inv-row:last-child { border-bottom: none; }
        .inv-id { font-size: 13px; font-weight: 700; color: #121927; margin: 0 0 2px; }
        .inv-meta { font-size: 10px; color: #94a3b8; margin: 0; }
        .inv-total { font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 800; color: #121927; margin: 0 0 4px; }
        .status-chip { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .status-green { background: #f0fdf4; color: #16a34a; }
        .status-amber { background: #fffbeb; color: #d97706; }
      `}</style>
    </div>
  )
}
