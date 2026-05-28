import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ─── Layout Component ──────────────────────────────────────────── */
export default function Layout({ children, showSidebar = true }) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="layout">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <Link to="/" className="header-logo-link">
              <div className="header-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="header-brand-text">
                <h1 className="header-brand-name">Stitch</h1>
                <p className="header-brand-sub">Stock &amp; Billing Hub</p>
              </div>
            </Link>
          </div>

          <nav className="header-nav">
            {!isAuthenticated ? (
              <div className="header-auth-links">
                <Link to="/login" className="header-link">Sign In</Link>
                <Link to="/register" className="header-link header-link-primary">Get Started</Link>
              </div>
            ) : (
              <div className="header-user-menu">
                <span className="header-user-greeting">Welcome back!</span>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="footer-brand-text">
              <h3 className="footer-brand-name">Stitch</h3>
              <p className="footer-brand-sub">Stock &amp; Billing Hub</p>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-section-title">Product</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Features</a></li>
                <li><a href="#" className="footer-link">Pricing</a></li>
                <li><a href="#" className="footer-link">Integrations</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-section-title">Support</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">Documentation</a></li>
                <li><a href="#" className="footer-link">Help Center</a></li>
                <li><a href="#" className="footer-link">Contact Us</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-section-title">Company</h4>
              <ul className="footer-list">
                <li><a href="#" className="footer-link">About</a></li>
                <li><a href="#" className="footer-link">Blog</a></li>
                <li><a href="#" className="footer-link">Careers</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} Stitch Commerce. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Privacy Policy</a>
              <a href="#" className="footer-bottom-link">Terms of Service</a>
              <a href="#" className="footer-bottom-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 4rem;
        }

        .header-brand {
          display: flex;
          align-items: center;
        }

        .header-logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .header-logo {
          background: linear-gradient(135deg, #735b18, #b1944c);
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
        }

        .header-brand-text h1 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .header-brand-text p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0.125rem 0 0;
          font-weight: 500;
        }

        .header-nav {
          display: flex;
          align-items: center;
        }

        .header-auth-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-link {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
          color: #374151;
        }

        .header-link:hover {
          background: #f3f4f6;
          color: #1f2937;
        }

        .header-link-primary {
          background: linear-gradient(135deg, #735b18, #b1944c);
          color: white;
        }

        .header-link-primary:hover {
          background: linear-gradient(135deg, #5a4613, #8a7540);
          color: white;
        }

        .header-user-greeting {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* ── Main Content ── */
        .main-content {
          flex: 1;
        }

        /* ── Footer ── */
        .footer {
          background: #1f2937;
          color: white;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1rem 2rem;
          display: grid;
          grid-template-columns: 1fr 3fr;
          gap: 3rem;
        }

        .footer-brand {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .footer-logo {
          background: linear-gradient(135deg, #735b18, #b1944c);
          border-radius: 6px;
          padding: 0.5rem;
          color: white;
          flex-shrink: 0;
        }

        .footer-brand-text h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.025em;
        }

        .footer-brand-text p {
          font-size: 0.75rem;
          color: #9ca3af;
          margin: 0.25rem 0 0;
          font-weight: 500;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }

        .footer-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-list li {
          margin-bottom: 0.5rem;
        }

        .footer-list a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .footer-list a:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          background: #111827;
        }

        .footer-bottom-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-copyright {
          font-size: 0.875rem;
          color: #9ca3af;
          margin: 0;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .footer-bottom-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .footer-bottom-link:hover {
          color: white;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .header-content {
            padding: 0 0.75rem;
            height: 3.5rem;
          }

          .header-brand-text h1 {
            font-size: 1.125rem;
          }

          .header-auth-links {
            gap: 0.5rem;
          }

          .header-link {
            padding: 0.375rem 0.75rem;
            font-size: 0.8125rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 2rem 0.75rem 1.5rem;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .footer-bottom-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1rem 0.75rem;
          }

          .footer-bottom-links {
            gap: 1.5rem;
          }
        }

        @media (max-width: 640px) {
          .footer-links {
            grid-template-columns: 1fr;
          }

          .footer-bottom-links {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}