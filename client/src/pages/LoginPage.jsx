import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      addToast('Welcome back!', 'success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-visual-shapes">
            <div className="shape shape-1" />
            <div className="shape shape-2" />
            <div className="shape shape-3" />
          </div>
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="24" height="24" rx="6" fill="url(#lg)" />
                <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="lg" x1="2" y1="2" x2="26" y2="26"><stop stopColor="#6C63FF" /><stop offset="1" stopColor="#00D4AA" /></linearGradient></defs>
              </svg>
            </div>
            <h1>Planex</h1>
            <p>Streamline your team's workflow with intelligent project management</p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Real-time task tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>Team collaboration</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Analytics dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="login-form">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? <span className="btn-loader" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
