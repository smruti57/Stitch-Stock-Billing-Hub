import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      {/* Decorative background grid */}
      <div className="login-bg-grid" />

      <div className="login-card">
        {/* Brand mark */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h1 className="login-brand-name">Stitch</h1>
            <p className="login-brand-sub">Stock &amp; Billing Hub</p>
          </div>
        </div>

        <div className="login-divider" />

        <h2 className="login-title">Welcome back</h2>
        <p className="login-subtitle">Sign in to your merchant account to continue.</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-field">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@yourbrand.com"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-btn-loading">
                <span className="spinner" /> Signing in…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register" className="login-link">Create one</Link>
        </p>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f0ede8;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .login-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(115,91,24,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(115,91,24,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .login-card {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 48px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 8px 48px rgba(26,35,50,0.10), 0 2px 8px rgba(26,35,50,0.06);
          animation: slideUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .login-logo {
          background: linear-gradient(135deg, #735b18, #b1944c);
          padding: 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .login-brand-name {
          font-family: 'Manrope', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #121927;
          line-height: 1;
          margin: 0;
        }
        .login-brand-sub {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin: 4px 0 0;
        }
        .login-divider {
          height: 1px;
          background: #f1f0ec;
          margin-bottom: 28px;
        }
        .login-title {
          font-family: 'Manrope', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #121927;
          margin: 0 0 6px;
        }
        .login-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 28px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #475569;
        }
        .form-input {
          padding: 12px 16px;
          background: #f8f7f4;
          border: none;
          border-bottom: 2px solid transparent;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #121927;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          border-bottom-color: #b1944c;
          box-shadow: 0 4px 12px rgba(177,148,76,0.10);
        }
        .form-input::placeholder { color: #94a3b8; }
        .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fff1f2;
          border-radius: 10px;
          font-size: 13px;
          color: #e11d48;
          font-weight: 500;
        }
        .login-btn {
          padding: 14px;
          background: linear-gradient(135deg, #735b18, #b1944c);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Manrope', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(115,91,24,0.28);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-footer {
          margin: 24px 0 0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }
        .login-link {
          color: #735b18;
          text-decoration: none;
          font-weight: 500;
        }

        .login-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
