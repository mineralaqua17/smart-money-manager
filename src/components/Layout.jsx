import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCurrency, CURRENCIES } from '../context/CurrencyContext'
import { useTheme } from '../context/ThemeContext'
import Sidebar from './Sidebar'

const NAV = [
  { to: '/dashboard', label: 'Home', color: '#0a84ff' },
  { to: '/transactions', label: 'Money', color: '#30d158' },
  { to: '/loans', label: 'Loans', color: '#ff9f0a' },
  { to: '/reminders', label: 'Remind', color: '#ff375f' },
  { to: '/reports', label: 'Reports', color: '#bf5af2' },
]

const ICONS = {
  '/dashboard': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  '/transactions': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  '/loans': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>,
  '/reminders': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  '/reports': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
}

function MobileDrawer({ open, onClose }) {
  const { signOut, user } = useAuth()
  const { currency, changeCurrency } = useCurrency()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const ALL_NAV = [
    { to: '/dashboard', label: 'Dashboard', color: '#0a84ff' },
    { to: '/transactions', label: 'Transactions', color: '#30d158' },
    { to: '/loans', label: 'Loans', color: '#ff9f0a' },
    { to: '/reports', label: 'Reports', color: '#bf5af2' },
    { to: '/reminders', label: 'Reminders', color: '#ff375f' },
    { to: '/settings', label: 'Settings', color: '#636366' },
  ]

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 200, opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transition: 'opacity 0.3s ease', backdropFilter: 'blur(8px)',
      }} />
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 290,
        background: 'var(--glass)', backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '1px solid var(--border)', zIndex: 201,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: open ? '20px 0 60px rgba(0,0,0,0.3)' : 'none',
      }}>
        <div style={{ padding: '54px 20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(145deg, #0a84ff, #0055d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(10,132,255,0.4)' }}>💰</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Smart Money</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>Manager</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', width: 30, height: 30, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>
        <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
          {ALL_NAV.map(({ to, label, color }) => (
            <NavLink key={to} to={to} onClick={onClose} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderRadius: 12, fontSize: 15, fontWeight: 500,
              color: isActive ? color : 'var(--text2)',
              background: isActive ? `${color}18` : 'transparent',
              marginBottom: 3, transition: 'all 0.2s', textDecoration: 'none',
            })}>
              <span style={{ color: 'inherit' }}>{ICONS[to] || '●'}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 12, padding: '10px 14px', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.keys(CURRENCIES).map(code => (
              <button key={code} onClick={() => changeCurrency(code)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: '1px solid', borderColor: currency === code ? 'var(--blue)' : 'var(--border)', background: currency === code ? 'var(--blue-dim)' : 'var(--bg3)', color: currency === code ? 'var(--blue)' : 'var(--text2)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{code}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <button onClick={async () => { await signOut(); navigate('/'); onClose() }} className="btn btn-ghost" style={{ width: '100%', fontSize: 13, borderRadius: 12 }}>Sign out</button>
        </div>
      </div>
    </>
  )
}

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const activeNav = NAV.find(n => location.pathname === n.to)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="main-content" style={{ flex: 1, padding: '28px 28px', overflowY: 'auto', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 8 }}>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px var(--shadow)' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(145deg, #0a84ff, #0055d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💰</div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Smart Money</span>
          </div>
          <div style={{ width: 38 }} />
        </div>
        {children}
      </main>
      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {NAV.map(({ to, label, color }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
            style={({ isActive }) => ({ color: isActive ? color : 'var(--text3)' })}>
            {ICONS[to]}
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
