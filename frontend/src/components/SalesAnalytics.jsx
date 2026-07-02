import { useState, useEffect } from 'react'
import { getSalesAnalytics } from '../api/invoiceApi'

export default function SalesAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await getSalesAnalytics()
      if (res.success) {
        setAnalytics(res.analytics)
        setError('')
      } else {
        setError(res.message || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err.message || 'Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading sales analysis...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">⚠ {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No sales data available yet. Create some invoices to see analytics.</p>
      </div>
    )
  }

  const { summary, topProducts = [], topCustomers = [], paymentBreakdown = [], tierAnalysis = [], statusBreakdown = [] } = analytics

  return (
    <div className="space-y-6 p-6 bg-gray-50">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Sales"
          value={`₹${(summary.totalSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon="💰"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          title="Total GST"
          value={`₹${(summary.totalGST || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon="📊"
          bgColor="bg-purple-50"
        />
        <SummaryCard
          title="Invoices"
          value={summary.invoiceCount || 0}
          icon="📄"
          bgColor="bg-green-50"
        />
        <SummaryCard
          title="Avg Order Value"
          value={`₹${(summary.avgOrderValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon="📈"
          bgColor="bg-orange-50"
        />
        <SummaryCard
          title="Discount Given"
          value={`₹${(summary.totalDiscount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon="🎁"
          bgColor="bg-red-50"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 8).map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{product.name}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{(product.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-gray-500">{product.totalQty} units</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No products sold yet</p>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⭐ Top Customers</h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.slice(0, 8).map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">{customer.customerName}</p>
                    <p className="text-xs text-gray-500">Orders: {customer.orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">₹{(customer.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No customer data yet</p>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💳 Payment Methods</h3>
        {paymentBreakdown.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {paymentBreakdown.map((method, idx) => {
              const methodIcons = {
                cash: '💵',
                card: '💳',
                upi: '📱',
                bank_transfer: '🏦',
              }
              return (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl mb-2">{methodIcons[method.paymentMethod] || '💰'}</p>
                  <p className="font-semibold text-gray-700 capitalize">{method.paymentMethod}</p>
                  <p className="text-sm text-gray-600">{method.count} transactions</p>
                  <p className="text-xs text-green-600 font-semibold">₹{(method.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No payment data yet</p>
        )}
      </div>

      {/* Customer Tiers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Customer Tiers</h3>
        {tierAnalysis.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {tierAnalysis.map((tier, idx) => {
              const tierIcons = {
                New: '🌟',
                Regular: '⭐',
                VIP: '👑',
              }
              return (
                <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <p className="text-2xl mb-2 text-center">{tierIcons[tier.tier] || '📊'}</p>
                  <p className="font-semibold text-gray-700 text-center">{tier.tier}</p>
                  <p className="text-sm text-gray-600 text-center mt-1">{tier.count} customers</p>
                  <div className="mt-3 p-2 bg-white rounded text-xs">
                    <p className="text-gray-600">Total: <span className="font-semibold">₹{(tier.totalSpent || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                    <p className="text-gray-600">Avg: <span className="font-semibold">₹{(tier.avgSpent || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span></p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No tier data yet</p>
        )}
      </div>

      {/* Invoice Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Invoice Status</h3>
        {statusBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statusBreakdown.map((status, idx) => {
              const statusColors = {
                PAID: 'bg-green-50 border-green-200',
                PENDING: 'bg-yellow-50 border-yellow-200',
                VOID: 'bg-red-50 border-red-200',
              }
              const statusIcons = {
                PAID: '✅',
                PENDING: '⏳',
                VOID: '❌',
              }
              return (
                <div key={idx} className={`p-4 rounded-lg border ${statusColors[status.status] || 'bg-gray-50'}`}>
                  <p className="text-2xl mb-2">{statusIcons[status.status] || '📄'}</p>
                  <p className="font-semibold text-gray-700">{status.status}</p>
                  <p className="text-sm text-gray-600">{status.count} invoices</p>
                  <p className="text-sm font-semibold text-gray-700 mt-2">₹{(status.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No invoice data yet</p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          🔄 Refresh Analytics
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, icon, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 shadow`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-gray-800 text-lg font-bold mt-1">{value}</p>
    </div>
  )
}
