import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/transactions', label: 'Transactions', icon: '↕' },
  { to: '/loans', label: 'Loans', icon: '◈' },
  { to: '/reports', label: 'Reports', icon: '◎' },
  { to: '/reminders', label: 'Reminders', icon: '⏰' },
  { to: '/settings', label: 'Settings', icon: '⊙' },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()
  const { currency, changeCurrency } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className="sidebar" style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700 }}>₿</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Smart Money</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.5px' }}>MANAGER</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 'var(--radius-sm)', fontSize: 13.5, fontWeight: 500,
            color: isActive ? '#fff' : 'var(--text2)',
            background: isActive ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'transparent',
            marginBottom: 2, transition: 'all 0.18s', textDecoration: 'none',
            boxShadow: isActive ? '0 4px 12px rgba(124,92,252,0.3)' : 'none',
          })}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          color: 'var(--text2)', fontSize: 12.5, cursor: 'pointer', width: '100%',
        }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {Object.keys(CURRENCIES).map(code => (
            <button key={code} onClick={() => changeCurrency(code)} style={{
              flex: 1, padding: '6px', borderRadius: 'var(--radius-xs)',
              border: '1px solid', borderColor: currency === code ? 'var(--accent)' : 'var(--border)',
              background: currency === code ? 'var(--accent-dim)' : 'var(--bg3)',
              color: currency === code ? 'var(--accent)' : 'var(--text2)',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{code}</button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        <button onClick={async () => { await signOut(); navigate('/') }} className="btn btn-ghost" style={{ width: '100%', fontSize: 12 }}>Sign out</button>
      </div>
    </aside>
  )
}
