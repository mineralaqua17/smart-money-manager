import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', emoji: '􀷄', color: '#0a84ff' },
  { to: '/transactions', label: 'Transactions', emoji: '􀖅', color: '#30d158' },
  { to: '/loans', label: 'Loans', emoji: '􀖆', color: '#ff9f0a' },
  { to: '/reports', label: 'Reports', emoji: '􀧊', color: '#bf5af2' },
  { to: '/reminders', label: 'Reminders', emoji: '􀐬', color: '#ff375f' },
  { to: '/settings', label: 'Settings', emoji: '􀣋', color: '#636366' },
]

const ICONS = {
  '/dashboard': (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z" opacity="0.9"/>
    </svg>
  ),
  '/transactions': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
    </svg>
  ),
  '/loans': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
      <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/>
    </svg>
  ),
  '/reports': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  '/reminders': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  '/settings': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
}

export default function Sidebar() {
  const { signOut, user } = useAuth()
  const { currency, changeCurrency } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(145deg, #0a84ff, #0055d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(10,132,255,0.4)',
            fontSize: 20,
          }}>💰</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>Smart Money</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {NAV.map(({ to, label, color }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 12,
            fontSize: 14, fontWeight: 500,
            color: isActive ? color : 'var(--text2)',
            background: isActive ? `${color}18` : 'transparent',
            marginBottom: 2, transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
            textDecoration: 'none',
          })}>
            <span style={{ color: 'inherit', display: 'flex', width: 20 }}>{ICONS[to]}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 12, padding: '10px 14px',
          color: 'var(--text2)', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', width: '100%', transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 16 }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(CURRENCIES).map(code => (
            <button key={code} onClick={() => changeCurrency(code)} style={{
              flex: 1, padding: '8px',
              borderRadius: 10,
              border: '1px solid',
              borderColor: currency === code ? 'var(--blue)' : 'var(--border)',
              background: currency === code ? 'var(--blue-dim)' : 'var(--bg3)',
              color: currency === code ? 'var(--blue)' : 'var(--text2)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>{code}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        <button onClick={async () => { await signOut(); navigate('/') }}
          className="btn btn-ghost" style={{ width: '100%', fontSize: 13, borderRadius: 12 }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
