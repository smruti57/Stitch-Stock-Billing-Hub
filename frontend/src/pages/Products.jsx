import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi'

const DEMO_PRODUCTS = [
  { id: 1, sku: 'SKU-2094', name: 'Luxury Silk Pocket Square', category: 'Accessories', stock: 45, price: 120, status: 'IN STOCK' },
  { id: 2, sku: 'SKU-5521', name: 'Italian Calfskin Belt', category: 'Leather Goods', stock: 8, price: 210, status: 'LOW STOCK' },
  { id: 3, sku: 'SKU-7741', name: 'Merino Turtleneck Sweater', category: 'Apparel', stock: 22, price: 185, status: 'IN STOCK' },
  { id: 4, sku: 'SKU-3318', name: 'Heritage Canvas Tote', category: 'Accessories', stock: 3, price: 95, status: 'LOW STOCK' },
  { id: 5, sku: 'SKU-9902', name: 'Slim Fit Oxford Shirt', category: 'Apparel', stock: 58, price: 145, status: 'IN STOCK' },
  { id: 6, sku: 'SKU-1150', name: 'Lunar Chronograph Watch', category: 'Accessories', stock: 12, price: 580, status: 'IN STOCK' },
  { id: 7, sku: 'SKU-6630', name: 'Cashmere Scarf', category: 'Apparel', stock: 30, price: 165, status: 'IN STOCK' },
  { id: 8, sku: 'SKU-4422', name: 'Suede Chelsea Boots', category: 'Footwear', stock: 6, price: 310, status: 'LOW STOCK' },
]

const INITIAL_CATEGORIES = ['All', 'Apparel', 'Accessories', 'Leather Goods', 'Footwear']

const EMPTY_FORM = { name: '', sku: '', category: 'Apparel', stock: '', price: '' }

export default function Products() {
  const [products, setProducts] = useState(DEMO_PRODUCTS)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showCategoryInput, setShowCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProducts()
      .then((data) => {
        const productList = (data.products || []).map(product => ({
          ...product,
          price: parseFloat(product.price),
          status: product.stock <= 10 ? 'LOW STOCK' : 'IN STOCK'
        }))
        setProducts(productList)
      })
      .catch((error) => {
        console.error('Failed to fetch products:', error)
        /* use demo data */
      })
  }, [])

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const openNew = () => {
    setEditingProduct(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({ name: product.name, sku: product.sku, category: product.category, stock: product.stock, price: product.price })
    setShowModal(true)
  }

  const addCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    const exists = categories.some((cat) => cat.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      setNewCategory('')
      setShowCategoryInput(false)
      return
    }
    setCategories((prev) => [...prev, trimmed])
    setCategoryFilter(trimmed)
    setNewCategory('')
    setShowCategoryInput(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setForm(EMPTY_FORM)
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form.name || !form.sku) return
    setSaving(true)
    try {
      if (editingProduct) {
        const response = await updateProduct(editingProduct.id, form)
        const updated = response.product || response
        updated.price = parseFloat(updated.price)
        updated.status = updated.stock <= 10 ? 'LOW STOCK' : 'IN STOCK'
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)))
      } else {
        const response = await createProduct(form)
        const created = response.product || response
        created.price = parseFloat(created.price)
        created.status = created.stock <= 10 ? 'LOW STOCK' : 'IN STOCK'
        setProducts((prev) => [...prev, created])
      }
      closeModal()
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await deleteProduct(id).catch(() => {})
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">{products.length} total SKUs across all categories.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search-input" placeholder="Search products or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="cat-filters">
          {categories.map((cat) => (
            <button key={cat} className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
              {cat}
            </button>
          ))}
          <button type="button" className="cat-add-btn" onClick={() => setShowCategoryInput((prev) => !prev)}>
            + Add Category
          </button>
        </div>
        {showCategoryInput && (
          <div className="cat-add-row">
            <input
              className="form-input category-input"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
            />
            <button type="button" className="btn-primary btn-sm" onClick={addCategory}>
              Add
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => { setShowCategoryInput(false); setNewCategory('') }}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="data-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th className="text-center">Stock</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No products found.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id}>
                <td className="sku-cell">{p.sku}</td>
                <td className="product-name-cell">{p.name}</td>
                <td className="category-cell">{p.category}</td>
                <td className="text-center font-bold">{p.stock}</td>
                <td className="font-bold">₹{Number(p.price).toLocaleString('en-IN')}.00</td>
                <td><span className={`status-chip ${p.status === 'IN STOCK' ? 'status-green' : 'status-amber'}`}>{p.status}</span></td>
                <td className="actions-cell">
                  <button className="icon-btn" onClick={() => openEdit(p)} title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="icon-btn danger" onClick={() => handleDelete(p.id)} title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Product Name</label>
                  <input name="name" className="form-input" value={form.name} onChange={handleFormChange} placeholder="e.g. Heritage Silk Tie" />
                </div>
                <div className="form-field">
                  <label className="form-label">SKU</label>
                  <input name="sku" className="form-input" value={form.sku} onChange={handleFormChange} placeholder="e.g. SKU-0001" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" value={form.category} onChange={handleFormChange}>
                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Stock Quantity</label>
                  <input name="stock" type="number" min="0" className="form-input" value={form.stock} onChange={handleFormChange} placeholder="0" />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Unit Price (₹)</label>
                <input name="price" type="number" min="0" className="form-input" value={form.price} onChange={handleFormChange} placeholder="0.00" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .search-wrapper { position: relative; flex: 1; max-width: 320px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        .search-input { width: 100%; padding: 10px 16px 10px 40px; background: white; border: none; border-radius: 12px; font-size: 13px; font-family: 'Inter', sans-serif; color: #121927; box-shadow: 0 2px 8px rgba(0,0,0,0.05); outline: none; }
        .search-input:focus { box-shadow: 0 0 0 2px rgba(177,148,76,0.25); }
        .cat-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .cat-btn { padding: 8px 16px; border: none; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: white; color: #64748b; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.2s; }
        .cat-btn.active { background: linear-gradient(135deg, #735b18, #b1944c); color: white; box-shadow: 0 4px 12px rgba(177,148,76,0.3); }
        .cat-btn:hover:not(.active) { background: #f1f5f9; }
        .cat-add-btn { border: 1px dashed #c9c9c9; background: white; color: #334155; padding: 8px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .cat-add-btn:hover { background: #f8fafc; }
        .cat-add-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
        .category-input { min-width: 220px; }
        .btn-sm { padding: 8px 14px; font-size: 12px; }
        .actions-cell { display: flex; gap: 8px; align-items: center; }
        .icon-btn { padding: 6px; border: none; background: #f1f5f9; border-radius: 8px; cursor: pointer; color: #64748b; display: flex; align-items: center; transition: all 0.15s; }
        .icon-btn:hover { background: #e2e8f0; color: #334155; }
        .icon-btn.danger:hover { background: #fff1f2; color: #f43f5e; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(18,25,39,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-card { background: white; border-radius: 20px; width: 100%; max-width: 520px; box-shadow: 0 24px 60px rgba(0,0,0,0.15); animation: slideUp 0.25s cubic-bezier(.22,1,.36,1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 28px 0; }
        .modal-title { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; color: #121927; }
        .modal-close { background: none; border: none; font-size: 18px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.15s; }
        .modal-close:hover { background: #f1f5f9; color: #334155; }
        .modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
        .modal-footer { padding: 0 28px 24px; display: flex; justify-content: flex-end; gap: 12px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .empty-row { text-align: center; color: #94a3b8; padding: 32px; font-size: 13px; }
      `}</style>
    </div>
  )
}
