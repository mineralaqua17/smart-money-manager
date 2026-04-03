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
      setSuccess('Check your email to confirm your account, then sign in.')
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) { setForgotSuccess(''); return }
    setForgotLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setForgotLoading(false)
    if (err) { setForgotSuccess('error:' + err.message) }
    else { setForgotSuccess('Password reset link sent! Check your email 📧') }
  }

  if (showForgot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-scale-in">
          <button onClick={() => setShowForgot(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, marginBottom: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to login
          </button>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Reset password</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
            Enter your email and we'll send you a reset link.
          </p>
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <label className="label">Email</label>
              <input className="input" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@email.com"
                onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
            </div>
            {forgotSuccess && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 14, fontSize: 13,
                background: forgotSuccess.startsWith('error:') ? 'var(--red-dim)' : 'var(--green-dim)',
                color: forgotSuccess.startsWith('error:') ? 'var(--red)' : 'var(--green)',
                border: `1px solid ${forgotSuccess.startsWith('error:') ? 'rgba(255,92,122,0.2)' : 'rgba(0,229,160,0.2)'}`,
              }}>
                {forgotSuccess.startsWith('error:') ? forgotSuccess.replace('error:', '') : forgotSuccess}
              </div>
            )}
            <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="animate-scale-in">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, color: 'var(--text2)', fontSize: 13 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>₿</div>
          Smart Money Manager
        </Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
          {mode === 'login' ? 'Sign in to manage your money.' : 'Start tracking your finances today.'}
        </p>

        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="label">Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12.5, cursor: 'pointer' }}>
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,92,122,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginTop: 14 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--green)', fontSize: 13, marginTop: 14 }}>
              {success}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 18, padding: 13, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', marginTop: 16 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Link to={mode === 'login' ? '/register' : '/login'} style={{ color: 'var(--accent)', fontWeight: 600 }}>
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
