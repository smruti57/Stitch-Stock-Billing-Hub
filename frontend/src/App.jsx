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
function Shell() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="shell">
      {/* Sidebar */}
      <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="sidebar-brand-logo">S</span>
            {!collapsed && <div className="sidebar-brand-text">Stitch</div>}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <span className="sidebar-toggle-icon">{collapsed ? '»' : '«'}</span>
          </button>
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
        .shell { display: flex; min-height: 100vh; background: #f0ede8; }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px;
          min-width: 240px;
          background: #1a2332;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          overflow-y: auto;
          padding-top: 4rem; /* Account for header height */
        }
        .sidebar.collapsed {
          width: 72px;
          min-width: 72px;
        }
        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 12px;
          gap: 12px;
          position: sticky;
          top: 0;
          background: rgba(26,35,50,0.95);
          backdrop-filter: blur(12px);
          z-index: 10;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #735b18, #b1944c);
          color: white;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 0.95rem;
        }
        .sidebar-brand-text {
          color: #f8fafc;
          font-size: 0.95rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .sidebar-toggle {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          color: #d4dce8;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.2s, transform 0.2s;
        }
        .sidebar-toggle:hover {
          background: rgba(255,255,255,0.12);
        }
        .sidebar.collapsed .sidebar-toggle-icon {
          transform: rotate(180deg);
        }
        .nav-section { padding: 8px 12px; flex: 1; }
        .sidebar.collapsed .nav-section { padding: 8px 8px; }
        .nav-section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #4f5f7b; padding: 0 8px; margin: 0 0 8px; }
        .sidebar.collapsed .nav-section-label { display: none; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; text-decoration: none; color: #8a9bb5; font-size: 13px; font-weight: 600; transition: all 0.2s; margin-bottom: 2px; }
        .sidebar.collapsed .nav-item { justify-content: center; padding: 11px 8px; }
        .sidebar.collapsed .nav-item span { display: none; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: #c9d4e3; }
        .nav-item.active { background: linear-gradient(135deg, rgba(115,91,24,0.3), rgba(177,148,76,0.2)); color: #d4a853; }
        .nav-item.active svg { stroke: #d4a853; }
        .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .sidebar.collapsed .sidebar-footer { padding: 12px 0; }
        .sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .user-avatar { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #735b18, #b1944c); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; flex-shrink: 0; }
        .user-name { font-size: 13px; font-weight: 700; color: #c9d4e3; margin: 0 0 1px; }
        .user-role { font-size: 10px; color: #4f5f7b; margin: 0; text-transform: uppercase; letter-spacing: 0.08em; }
        .user-info { flex: 1; min-width: 0; }
        .logout-btn { background: none; border: none; color: #f43f5e; cursor: pointer; padding: 8px; border-radius: 8px; display: flex; align-items: center; transition: background 0.15s; }
        .logout-btn:hover { background: rgba(244,63,94,0.1); }

        /* ── Main ── */
        .main-content {
          margin-left: 240px;
          margin-top: 4rem;
          flex: 1;
          min-height: calc(100vh - 4rem);
          padding: 0 18px;
          display: flex;
          justify-content: center;
        }
        .sidebar.collapsed + .main-content,
        .shell .sidebar.collapsed + .main-content {
          margin-left: 72px;
        }

        /* ── Loading ── */
        .app-loading { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: #f0ede8; }
        .app-spinner { width: 36px; height: 36px; border: 3px solid rgba(177,148,76,0.2); border-top-color: #b1944c; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ─── Root App ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/register" element={<RegisterGuard />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Shell />
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
