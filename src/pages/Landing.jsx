import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '📊', title: 'Smart Dashboard', desc: 'See your complete financial picture at a glance.', color: '#0a84ff' },
  { icon: '💳', title: 'Track Everything', desc: 'Income, expenses and loans all in one place.', color: '#30d158' },
  { icon: '📈', title: 'Visual Reports', desc: 'Beautiful charts that show where money goes.', color: '#bf5af2' },
  { icon: '⏰', title: 'Email Reminders', desc: 'Never miss a payment with smart reminders.', color: '#ff9f0a' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(145deg, #0a84ff, #0055d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💰</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>Smart Money Manager</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <button className="btn btn-primary" style={{ borderRadius: 99 }} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
            <>
              <button className="btn btn-ghost" style={{ borderRadius: 99 }} onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn btn-primary" style={{ borderRadius: 99 }} onClick={() => navigate('/register')}>Get started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '90px 24px 70px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-dim)', border: '1px solid rgba(10,132,255,0.2)', borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 24 }}>
          ✨ Free forever · No subscription
        </div>
        <h1 className="animate-slide-up-1" style={{ fontSize: 'clamp(36px, 6vw, 62px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 22 }}>
          Your money,<br />
          <span style={{ background: 'linear-gradient(135deg, #0a84ff, #bf5af2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>under control.</span>
        </h1>
        <p className="animate-slide-up-2" style={{ color: 'var(--text2)', fontSize: 18, lineHeight: 1.65, marginBottom: 36 }}>
          Track income, expenses, and loans with automatic calculations and beautiful reports. Built for Indonesians.
        </p>
        <div className="animate-slide-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16, borderRadius: 99 }} onClick={() => navigate('/register')}>
            Start for free →
          </button>
          <button className="btn btn-ghost" style={{ padding: '14px 24px', fontSize: 16, borderRadius: 99 }} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`card card-hover animate-slide-up-${i + 1}`} style={{ borderRadius: 20, textAlign: 'center', padding: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: `${f.color}20`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.2px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 420, margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Simple pricing</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 15 }}>Free to use. Always.</p>
        <div className="card" style={{ borderRadius: 24, border: '1px solid rgba(10,132,255,0.3)', textAlign: 'left', padding: 28, background: 'linear-gradient(145deg, rgba(10,132,255,0.05), transparent)' }}>
          <div style={{ display: 'inline-flex', background: 'var(--blue-dim)', color: 'var(--blue)', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>FREE</div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>Rp 0</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>Forever free</div>
          {['Unlimited transactions', 'Loan tracker', 'Monthly reports', 'Multi-currency', 'Email reminders'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {item}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 14, fontSize: 15 }} onClick={() => navigate('/register')}>
            Get started free →
          </button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
        © {new Date().getFullYear()} Smart Money Manager
      </footer>
    </div>
  )
}
