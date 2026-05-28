import { useState } from 'react'

const SETTINGS_TABS = ['DASHBOARD', 'POS', 'SETTINGS']

const DEMO_BUSINESS = {
  logo: null,
  legalName: 'ShopFlow Premium Retailers Ltd.',
  taxId: 'TX-5920-SFH-2024',
  address: '722 Andler Way, Design District, NY',
  currency: 'USD - United States Dollar',
}

const DEMO_TEAM = [
  { id: 1, role: 'Store Administrator', users: 2, level: 'FULL ACCESS', actions: ['edit', 'delete'] },
  { id: 2, role: 'Cashier Associate', users: 1, level: 'RESTRICTED', actions: ['edit', 'delete'] },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('SETTINGS')
  const [business, setBusiness] = useState(DEMO_BUSINESS)
  const [autoPrintReceipts, setAutoPrintReceipts] = useState(true)
  const [selectedPrinter, setSelectedPrinter] = useState('Epson TM-T88IV (Network)')

  const [accessControl, setAccessControl] = useState({
    managerOverride: true,
    inventoryEdits: true,
    refundProcessing: true,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleBusinessChange = (field, value) => {
    setBusiness({ ...business, [field]: value })
  }

  const handleAccessChange = (field) => {
    setAccessControl({ ...accessControl, [field]: !accessControl[field] })
  }

  return (
    <div className="page-root settings-page">
      <div className="settings-header">
        <h2>System Settings</h2>
        <div className="settings-actions">
          <button className="btn-secondary">Discard Changes</button>
          <button className="btn-primary" onClick={handleSave}>Save Configuration</button>
        </div>
      </div>

      {saved && <div className="success-banner">✓ Configuration saved successfully</div>}

      <div className="settings-container">
        {/* Left Sidebar */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <div className="nav-section">
              <h4>Business Setup</h4>
              <a href="#" className="nav-item active">
                📋 Business Profile
              </a>
              <a href="#" className="nav-item">
                🖨️ POS Configuration
              </a>
            </div>

            <div className="nav-section">
              <h4>Security & Access</h4>
              <a href="#" className="nav-item">
                👤 User Permissions
              </a>
              <a href="#" className="nav-item">
                🔔 Notifications
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="settings-main">
          {/* Tabs */}
          <div className="settings-tabs">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Business Profile Section */}
          <section className="settings-section">
            <h3>Business Identity</h3>

            <div className="form-group">
              <label>Company Logo</label>
              <div className="logo-upload">
                <div className="logo-preview">
                  📷
                </div>
                <div className="logo-info">
                  <p className="logo-label">Company Logo</p>
                  <p className="logo-hint">SVG, JPEG or JPG (max. 800x400px)</p>
                  <button className="btn-outline">Upload Logo</button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Legal Business Name</label>
                <input
                  type="text"
                  value={business.legalName}
                  onChange={(e) => handleBusinessChange('legalName', e.target.value)}
                  placeholder="Your business legal name"
                />
              </div>
              <div className="form-group">
                <label>Tax Identification Number</label>
                <input
                  type="text"
                  value={business.taxId}
                  onChange={(e) => handleBusinessChange('taxId', e.target.value)}
                  placeholder="Tax ID"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Headquarters Address</label>
              <input
                type="text"
                value={business.address}
                onChange={(e) => handleBusinessChange('address', e.target.value)}
                placeholder="Full address"
              />
            </div>

            <div className="form-group">
              <label>Primary Currency</label>
              <select value={business.currency} onChange={(e) => handleBusinessChange('currency', e.target.value)}>
                <option>USD - United States Dollar</option>
                <option>INR - Indian Rupee</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
              </select>
            </div>
          </section>

          {/* Hardware & Printing Section */}
          <section className="settings-section">
            <h3>Hardware & Printing</h3>

            <div className="settings-card">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Auto-Print Receipts</h4>
                  <p>Print receipts automatically on transaction completion</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={autoPrintReceipts}
                    onChange={(e) => setAutoPrintReceipts(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <label>Select Thermal Printer</label>
                <select value={selectedPrinter} onChange={(e) => setSelectedPrinter(e.target.value)}>
                  <option>Epson TM-T88IV (Network)</option>
                  <option>Star Micronics TSP100</option>
                  <option>Brother HL-L8360CDW</option>
                </select>
              </div>
            </div>
          </section>

          {/* Access Control Section */}
          <section className="settings-section">
            <h3>Access Control</h3>
            <p className="section-subtitle">Configure global security protocols for all store terminals and mobile access units</p>

            <div className="access-control-card">
              <div className="control-item">
                <div className="control-info">
                  <h4>Manager Override</h4>
                  <p>Allow managers to override transaction limits</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={accessControl.managerOverride}
                    onChange={() => handleAccessChange('managerOverride')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="control-item">
                <div className="control-info">
                  <h4>Inventory Edits</h4>
                  <p>Restrict inventory modifications without supervisor approval</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={accessControl.inventoryEdits}
                    onChange={() => handleAccessChange('inventoryEdits')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="control-item">
                <div className="control-info">
                  <h4>Refund Processing</h4>
                  <p>Enable refunds above ₹5000 only for authorized staff</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={accessControl.refundProcessing}
                    onChange={() => handleAccessChange('refundProcessing')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </section>

          {/* Team Access Permissions Section */}
          <section className="settings-section">
            <div className="section-header">
              <h3>Team Access Permissions</h3>
              <button className="btn-outline">+ ADD NEW ROLE</button>
            </div>

            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Role Designation</th>
                  <th>Users</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_TEAM.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className="role-cell">
                        <span className="role-icon">
                          {role.role === 'Store Administrator' ? '👑' : '👨'}
                        </span>
                        {role.role}
                      </div>
                    </td>
                    <td>
                      <div className="user-avatars">
                        {[...Array(role.users)].map((_, i) => (
                          <span key={i} className="avatar">
                            {String.fromCharCode(65 + i)}
                          </span>
                        ))}
                        <span className="user-count">+{role.users - 1}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`level-badge ${role.level === 'FULL ACCESS' ? 'full' : 'restricted'}`}>
                        {role.level}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
      </div>

      <style>{`
        .settings-page { padding: 24px; background: #f5f5f5; }
        .settings-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .settings-header h2 { margin: 0; font-size: 28px; }
        .settings-actions { display: flex; gap: 12px; }
        .btn-primary { background: #b1944c; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; }
        .btn-primary:hover { background: #9d7f3f; }
        .btn-secondary { background: white; color: #666; border: 1px solid #ddd; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .btn-outline { background: white; border: 1px solid #b1944c; color: #b1944c; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 700; }
        .success-banner { background: #d1fae5; color: #047857; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }

        .settings-container { display: grid; grid-template-columns: 200px 1fr; gap: 24px; }
        .settings-sidebar { background: white; border-radius: 12px; padding: 20px; height: fit-content; }
        .settings-nav { display: flex; flex-direction: column; gap: 16px; }
        .nav-section h4 { font-size: 11px; text-transform: uppercase; color: #999; margin: 0 0 8px; font-weight: 700; }
        .nav-item { display: block; padding: 8px 12px; border-radius: 6px; text-decoration: none; color: #666; font-size: 13px; }
        .nav-item.active { background: #b1944c; color: white; }
        .nav-item:hover { background: #f0f0f0; }

        .settings-main { background: white; border-radius: 12px; padding: 24px; }
        .settings-tabs { display: flex; gap: 24px; border-bottom: 1px solid #eee; margin-bottom: 32px; }
        .tab-btn { background: none; border: none; padding: 12px 0; border-bottom: 2px solid transparent; cursor: pointer; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #999; }
        .tab-btn.active { color: #b1944c; border-bottom-color: #b1944c; }

        .settings-section { margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #f0f0f0; }
        .settings-section:last-child { border-bottom: none; }
        .settings-section h3 { font-size: 18px; margin: 0 0 8px; }
        .section-subtitle { color: #999; font-size: 13px; margin: 0 0 16px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 8px; font-weight: 700; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #b1944c; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .logo-upload { display: flex; gap: 20px; }
        .logo-preview { width: 120px; height: 120px; background: #f5f5f5; border: 2px dashed #ddd; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .logo-info { display: flex; flex-direction: column; gap: 8px; }
        .logo-label { margin: 0; font-weight: 700; font-size: 14px; }
        .logo-hint { margin: 0; font-size: 12px; color: #999; }

        .settings-card { background: #f9f9f9; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
        .setting-item { display: flex; justify-content: space-between; align-items: center; }
        .setting-item label:first-child { margin: 0; }
        .setting-item h4 { margin: 0; font-size: 14px; }
        .setting-item p { margin: 4px 0 0; font-size: 12px; color: #999; }

        .access-control-card { background: #1a2332; border-radius: 12px; padding: 24px; color: white; }
        .control-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid #2a3e5f; }
        .control-item:last-child { border-bottom: none; }
        .control-info h4 { margin: 0; font-size: 14px; color: white; }
        .control-info p { margin: 4px 0 0; font-size: 12px; color: #8a9bb5; }

        .toggle-switch { display: inline-flex; width: 50px; height: 26px; position: relative; cursor: pointer; }
        .toggle-switch input { display: none; }
        .slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #ccc; border-radius: 13px; transition: 0.3s; }
        .toggle-switch input:checked + .slider { background: #b1944c; }
        .slider::before { content: ''; position: absolute; width: 22px; height: 22px; left: 2px; bottom: 2px; background: white; border-radius: 50%; transition: 0.3s; }
        .toggle-switch input:checked + .slider::before { transform: translateX(24px); }
        .control-item .slider { background: #4f5f7b; }
        .control-item input:checked + .slider { background: #b1944c; }

        .permissions-table { width: 100%; border-collapse: collapse; }
        .permissions-table th { font-size: 11px; text-transform: uppercase; color: #999; text-align: left; padding: 12px; border-bottom: 1px solid #eee; font-weight: 700; }
        .permissions-table td { padding: 16px 12px; border-bottom: 1px solid #f5f5f5; }
        .permissions-table tbody tr:hover { background: #f9f9f9; }
        .role-cell { display: flex; align-items: center; gap: 8px; }
        .role-icon { font-size: 18px; }
        .user-avatars { display: flex; gap: 6px; align-items: center; }
        .avatar { display: inline-flex; width: 28px; height: 28px; background: #b1944c; color: white; border-radius: 50%; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .user-count { font-size: 12px; color: #999; margin-left: 4px; }
        .level-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; }
        .level-badge.full { background: #f0fdf4; color: #16a34a; }
        .level-badge.restricted { background: #fef3c7; color: #d97706; }
        .action-btn { background: none; border: none; font-size: 18px; cursor: pointer; }
      `}</style>
    </div>
  )
}
