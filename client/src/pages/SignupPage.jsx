import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signup(form.name, form.email, form.password)
      addToast('Account created successfully!', 'success')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const messages = Object.values(data).flat()
        setError(messages.join(' '))
      } else {
        setError('Something went wrong. Please try again.')
      }
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
                <rect x="2" y="2" width="24" height="24" rx="6" fill="url(#lg2)" />
                <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs><linearGradient id="lg2" x1="2" y1="2" x2="26" y2="26"><stop stopColor="#6C63FF" /><stop offset="1" stopColor="#00D4AA" /></linearGradient></defs>
              </svg>
            </div>
            <h1>Planex</h1>
            <p>Join thousands of teams shipping better products, faster</p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span>Get started in seconds</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Enterprise-grade security</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Role-based access control</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Start managing your projects today</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="signup-form">
            {error && <div className="form-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm">Confirm password</label>
              <input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? <span className="btn-loader" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
