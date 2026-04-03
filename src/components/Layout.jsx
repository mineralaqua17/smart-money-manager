import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from './Sidebar'

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Home', icon: '▦' },
  { to: '/transactions', label: 'Txns', icon: '↕' },
  { to: '/loans', label: 'Loans', icon: '◈' },
  { to: '/reminders', label: 'Remind', icon: '⏰' },
  { to: '/reports', label: 'Reports', icon: '◎' },
]

const DRAWER_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/transactions', label: 'Transactions', icon: '↕' },
  { to: '/loans', label: 'Loans', icon: '◈' },
  { to: '/reports', label: 'Reports', icon: '◎' },
  { to: '/reminders', label: 'Reminders', icon: '⏰' },
  { to: '/settings', label: 'Settings', icon: '⊙' },
]

function MobileDrawer({ open, onClose }) {
  const { signOut, user } = useAuth()
  const { currency, changeCurrency } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 200,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.25s ease',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 280,
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        zIndex: 201,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: open ? '8px 0 32px rgba(0,0,0,0.3)' : 'none',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>₿</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700 }}>Smart Money</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.5px' }}>MANAGER</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', width: 28, height: 28, borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {DRAWER_NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : 'var(--text2)',
              background: isActive ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'transparent',
              marginBottom: 3, transition: 'all 0.18s', textDecoration: 'none',
              boxShadow: isActive ? '0 4px 12px rgba(124,92,252,0.3)' : 'none',
            })}>
              <span style={{ fontSize: 18, width: 22, textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            color: 'var(--text2)', fontSize: 13, cursor: 'pointer', width: '100%',
          }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {/* Currency */}
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.keys(CURRENCIES).map(code => (
              <button key={code} onClick={() => changeCurrency(code)} style={{
                flex: 1, padding: '8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid',
                borderColor: currency === code ? 'var(--accent)' : 'var(--border)',
                background: currency === code ? 'var(--accent-dim)' : 'var(--bg3)',
                color: currency === code ? 'var(--accent)' : 'var(--text2)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>{code}</button>
            ))}
          </div>

          {/* User info */}
          <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 2px' }}>
            {user?.email}
          </div>
          <button onClick={async () => { await signOut(); navigate('/'); onClose() }}
            className="btn btn-ghost" style={{ width: '100%', fontSize: 13 }}>
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content */}
      <main className="main-content" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}>
          <button onClick={() => setDrawerOpen(true)} style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text)',
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 18,
          }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>₿</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>Smart Money</span>
          </div>
          <div style={{ width: 38 }} />
        </div>

        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {MOBILE_NAV.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
