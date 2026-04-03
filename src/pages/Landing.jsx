import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: '↕', title: 'Track Income & Expenses', desc: 'Log every transaction in seconds. Categorized automatically.' },
  { icon: '◈', title: 'Loan Manager', desc: 'Track all your loans, monthly payments, and interest in one place.' },
  { icon: '◎', title: 'Smart Reports', desc: 'Visual charts that show exactly where your money goes every month.' },
  { icon: '⊙', title: 'Multi-Currency', desc: 'Supports Indonesian Rupiah and USD. Switch anytime.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
          Smart Money Manager
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>Get started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: 700, margin: '0 auto' }}>
        <div className="badge badge-amber" style={{ marginBottom: 20 }}>One-time purchase · Lifetime access</div>
        <h1 className="fade-up" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: 24,
        }}>
          Know exactly where<br />your money goes.
        </h1>
        <p className="fade-up" style={{ color: 'var(--text2)', fontSize: 17, lineHeight: 1.7, marginBottom: 40, animationDelay: '0.1s' }}>
          Smart Money Manager tracks your income, expenses, and loans — with automatic calculations and beautiful reports.
        </p>
        <div className="fade-up" style={{ display: 'flex', gap: 12, justifyContent: 'center', animationDelay: '0.2s' }}>
          <button className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 15 }} onClick={() => navigate('/register')}>
            Start for free →
          </button>
          <button className="btn btn-ghost" style={{ padding: '13px 24px', fontSize: 15 }} onClick={() => navigate('/login')}>
            Sign in
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 14,
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 420, margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Simple pricing</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Pay once, use forever. No subscriptions.</p>
        <div className="card" style={{ border: '1px solid var(--accent)', textAlign: 'left' }}>
          <div className="badge badge-blue" style={{ marginBottom: 16 }}>Lifetime Access</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, marginBottom: 4 }}>$9.99</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>or Rp 149.000 — one time</div>
          {['Unlimited transactions', 'Loan tracker', 'Monthly & yearly reports', 'Multi-currency support', 'Lifetime updates'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--green)' }}>✓</span> {item}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: '13px' }}
            onClick={() => navigate('/register')}>
            Get lifetime access →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
        © {new Date().getFullYear()} Smart Money Manager · Built for people who want to control their money.
      </footer>
    </div>
  )
}
