import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'
import Layout from '../components/Layout'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { currency, changeCurrency } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState({ full_name: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    await supabase.from('profiles').upsert({ id: user.id, full_name: profile.full_name, currency })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

        {/* Profile */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 16 }}>👤 Profile</div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Full name</label>
            <input className="input" value={profile.full_name || ''} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your name" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="label">Email</label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
            {saved ? '✓ Saved!' : loading ? 'Saving...' : 'Save profile'}
          </button>
        </div>

        {/* Appearance */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 16 }}>🎨 Appearance</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['dark', 'light'].map(t => (
              <button key={t} onClick={() => theme !== t && toggleTheme()}
                style={{
                  padding: '16px', borderRadius: 'var(--radius-sm)',
                  border: '2px solid', borderColor: theme === t ? 'var(--accent)' : 'var(--border)',
                  background: theme === t ? 'var(--accent-dim)' : 'var(--bg3)',
                  color: theme === t ? 'var(--accent)' : 'var(--text2)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t === 'dark' ? '🌙' : '☀️'}</div>
                <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{t} mode</div>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 16 }}>💱 Currency</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(CURRENCIES).map(([code, cur]) => (
              <button key={code} onClick={() => changeCurrency(code)}
                style={{
                  padding: '16px', borderRadius: 'var(--radius-sm)',
                  border: '2px solid', borderColor: currency === code ? 'var(--accent)' : 'var(--border)',
                  background: currency === code ? 'var(--accent-dim)' : 'var(--bg3)',
                  color: currency === code ? 'var(--accent)' : 'var(--text2)',
                  textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s',
                }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{cur.symbol}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{code}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{cur.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="card" style={{ borderColor: 'rgba(255,92,122,0.2)' }}>
          <div style={{ fontSize: 12, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 14 }}>⚠️ Account</div>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            Signed in as <strong style={{ color: 'var(--text)' }}>{user?.email}</strong>
          </p>
          <button className="btn btn-danger" onClick={async () => { await signOut(); window.location.href = '/' }}>Sign out</button>
        </div>
      </div>
    </Layout>
  )
}
