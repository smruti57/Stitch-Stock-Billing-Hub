import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Billing from './pages/Billing'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

/* ─── Protected Route ──────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="app-loading"><div className="app-spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

/* ─── Sidebar Nav Item ──────────────────────────────────────────── */
function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

/* ─── Shell Layout ──────────────────────────────────────────────── */
function Shell({ collapsed, toggleCollapsed }) {
  const { user, logout } = useAuth()

  return (
    <div className="shell">
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <button
              type="button"
              className="sidebar-brand-logo"
              onClick={toggleCollapsed}
              aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
              title="Toggle menu"
            >
              SF
            </button>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <div>ShopFlow</div>
                <p>Stock & Billing Hub</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <div className="nav-section">
          <p className="nav-section-label">Main Menu</p>
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
          />
          <NavItem
            to="/products"
            label="Inventory"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
          />
          <NavItem
            to="/billing"
            label="Billing / POS"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>}
          />
          <NavItem
            to="/customers"
            label="Customers"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
          />
          <NavItem
            to="/reports"
            label="Reports"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h5M8 16h8"/></svg>}
          />
          <NavItem
            to="/settings"
            label="Settings"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v.01M12 12v.01M12 16v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2) : 'AD'}
            </div>
            {!collapsed && (
              <div className="user-info">
                <p className="user-name">{user?.name || 'Admin'}</p>
                <p className="user-role">{user?.role || 'Merchant'}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <style>{`
        .shell { display: flex; flex-direction: column; min-height: 100vh; background: #f0ede8; }

        /* ── Header ── */
        .sidebar {
          width: 260px;
          min-width: 260px;
          background: #0f1419;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          overflow-y: auto;
          padding-top: 0;
        }
        .sidebar.collapsed {
          width: 84px;
          min-width: 84px;
        }
        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 20px 16px;
          gap: 12px;
          position: sticky;
          top: 0;
          background: #0f1419;
          z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(135deg, #d4a853, #b1944c);
          color: white;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 13px;
          flex-shrink: 0;
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .sidebar-brand-logo:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(212,168,83,0.18);
        }
        .sidebar-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sidebar-brand-text > div {
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 800;
          font-family: 'Manrope', sans-serif;
          letter-spacing: -0.5px;
        }
        .sidebar-brand-text > p {
          color: #64748b;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .nav-section { padding: 16px 12px; flex: 1; }
        .sidebar.collapsed .nav-section { padding: 16px 8px; }
        .nav-section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #475569; padding: 0 12px; margin: 0 0 12px; }
        .sidebar.collapsed .nav-section-label { display: none; }
        .nav-item { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 8px; text-decoration: none; color: #94a3b8; font-size: 13px; font-weight: 700; transition: all 0.2s ease; margin-bottom: 4px; position: relative; }
        .sidebar.collapsed .nav-item { justify-content: center; padding: 12px 8px; gap: 0; }
        .sidebar.collapsed .nav-item span { display: none; }
        .nav-item:hover { background: rgba(255,255,255,0.08); color: #cbd5e1; }
        .nav-item.active { background: rgba(212,168,83,0.15); color: #d4a853; border-left: 3px solid #d4a853; padding-left: 11px; }
        .sidebar.collapsed .nav-item.active { border-left: none; }
        .nav-item svg { stroke-width: 2.2; }
        .nav-item.active svg { stroke: #d4a853; }
        .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.08); }
        .sidebar.collapsed .sidebar-footer { padding: 12px 0; }
        .sidebar-user { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .user-avatar { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #d4a853, #b1944c); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 13px; flex-shrink: 0; }
        .sidebar.collapsed .user-avatar { width: 32px; height: 32px; font-size: 11px; }
        .user-name { font-size: 13px; font-weight: 800; color: #f1f5f9; margin: 0 0 2px; }
        .user-role { font-size: 10px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .user-info { flex: 1; min-width: 0; }
        .logout-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; transition: all 0.15s; font-weight: 700; }
        .logout-btn:hover { background: rgba(244,63,94,0.15); color: #f43f5e; }

        /* ── Main ── */
        .main-content {
          display: flex;
          flex: 1;
          margin-top: 0;
          margin-left: 260px;
          transition: margin-left 0.3s ease;
          padding: 0 18px;
          justify-content: center;
        }
        .sidebar.collapsed ~ .main-content {
          margin-left: 84px;
        }

        /* ── Loading ── */
        .app-loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: #f0ede8; }
        .app-spinner { width: 36px; height: 36px; border: 3px solid rgba(177,148,76,0.2); border-top-color: #b1944c; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sidebar {
            width: 220px;
          }
          .sidebar.collapsed {
            width: 64px;
          }
          .main-content {
            margin-left: 220px;
          }
          .sidebar.collapsed ~ .main-content {
            margin-left: 64px;
          }
        }
      `}</style>
    </div>
  )
}

/* ─── Root App ──────────────────────────────────────────────────── */
export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const toggleCollapsed = () => setCollapsed(prev => !prev)

  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout onSidebarToggle={toggleCollapsed}>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/register" element={<RegisterGuard />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Shell collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}

/* Redirect to /dashboard if already logged in */
function LoginGuard() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Login />
}

/* Redirect to /dashboard if already logged in */
function RegisterGuard() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Register />
}
