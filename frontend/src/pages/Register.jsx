import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      const serverMessage = err?.response?.data?.message
      const fallbackMessage = err?.message || 'Registration failed. Please try again.'
      setError(serverMessage || fallbackMessage)
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

        <h2 className="login-title">Create your account</h2>
        <p className="login-subtitle">Join Stitch to start managing your business.</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-field">
            <label htmlFor="name" className="form-label">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input"
              disabled={loading}
            />
          </div>

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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
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
                <span className="spinner" /> Creating account…
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="login-footer">
          Already have an account? <Link to="/login" className="login-link">Sign in</Link>
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
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .login-logo {
          background: linear-gradient(135deg, #735b18, #b1944c);
          border-radius: 12px;
          padding: 0.625rem;
          flex-shrink: 0;
        }
        .login-brand-name {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          letter-spacing: -0.025em;
        }
        .login-brand-sub {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0 0;
          font-weight: 500;
        }
        .login-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
          margin: 1.5rem 0;
        }
        .login-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }
        .login-subtitle {
          color: #6b7280;
          margin: 0 0 2.5rem 0;
          font-size: 1rem;
          line-height: 1.5;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.025em;
          text-transform: uppercase;
        }
        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          background: #fafafa;
        }
        .form-input:focus {
          outline: none;
          border-color: #735b18;
          background: white;
          box-shadow: 0 0 0 3px rgba(115,91,24,0.1);
        }
        .form-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .login-error {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .login-btn {
          background: linear-gradient(135deg, #735b18, #b1944c);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(115,91,24,0.25);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .login-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255,255,255,.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .login-footer {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 2.5rem;
        }
        .login-link {
          color: #735b18;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }
        .login-link:hover {
          color: #b1944c;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}