import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function AuthForm({ mode }) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Please fill all fields.'); return }
    setLoading(true); setError('')
    if (mode === 'login') {
      const { error: err } = await signIn(form.email, form.password)
      if (err) { setError(err.message); setLoading(false); return }
      navigate('/dashboard')
    } else {
      const { error: err } = await signUp(form.email, form.password)
      if (err) { setError(err.message); setLoading(false); return }
      setSuccess('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!forgotEmail) return
    setForgotLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: `${window.location.origin}/reset-password` })
    setForgotLoading(false)
    setForgotSuccess(err ? `Error: ${err.message}` : 'Reset link sent! Check your email 📧')
  }

  if (showForgot) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="animate-scale-in">
        <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 14, fontWeight: 600, marginBottom: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.5px' }}>Reset password</h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 28 }}>We'll send you a reset link.</p>
        <div className="card" style={{ borderRadius: 20 }}>
          <label className="label">Email</label>
          <input className="input" style={{ borderRadius: 12, marginBottom: 14 }} type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@email.com" onKeyDown={e => e.key === 'Enter' && handleForgot()} />
          {forgotSuccess && <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13, background: forgotSuccess.startsWith('Error') ? 'var(--red-dim)' : 'var(--green-dim)', color: forgotSuccess.startsWith('Error') ? 'var(--red)' : 'var(--green)' }}>{forgotSuccess}</div>}
          <button className="btn btn-primary" style={{ width: '100%', padding: 14, borderRadius: 14, fontSize: 15 }} onClick={handleForgot} disabled={forgotLoading}>
            {forgotLoading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="animate-scale-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(145deg, #0a84ff, #0055d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(10,132,255,0.4)' }}>💰</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to Smart Money Manager' : 'Create your free account'}
          </p>
        </div>

        <div className="card" style={{ borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input className="input" style={{ borderRadius: 12 }} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" style={{ borderRadius: 12 }} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" style={{ borderRadius: 12 }} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: 10 }}>
              <button onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Forgot password?</button>
            </div>
          )}

          {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginTop: 14 }}>{error}</div>}
          {success && <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(48,209,88,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--green)', fontSize: 13, marginTop: 14 }}>{success}</div>}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 14, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 18 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link to={mode === 'login' ? '/register' : '/login'} style={{ color: 'var(--blue)', fontWeight: 700 }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export function Login() { return <AuthForm mode="login" /> }
export function Register() { return <AuthForm mode="register" /> }
