import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import Layout from '../components/Layout'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip)

const SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CAT_COLORS = ['#ff5c7a','#4d9fff','#00e5a0','#ffb347','#a78bfa','#38bdf8','#facc15','#fb923c','#94a3b8','#e879f9']

function SummaryCard({ label, value, color, emoji }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.7px', fontWeight: 600, marginBottom: 6 }}>
        {emoji} {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

export default function Reports() {
  const { user } = useAuth()
  const { fmt } = useCurrency()
  const [txns, setTxns] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    supabase.from('transactions').select('*').eq('user_id', user.id)
      .then(({ data }) => setTxns(data || []))
  }, [])

  const yearTxns = txns.filter(t => new Date(t.date).getFullYear() === year)

  const monthlyIncome = SHORT.map((_, i) =>
    yearTxns.filter(t => new Date(t.date).getMonth() === i && t.type === 'income').reduce((s, t) => s + t.amount, 0))
  const monthlyExpense = SHORT.map((_, i) =>
    yearTxns.filter(t => new Date(t.date).getMonth() === i && t.type === 'expense').reduce((s, t) => s + t.amount, 0))

  const byCategory = {}
  yearTxns.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })
  const catEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  const totalIncome = monthlyIncome.reduce((s, v) => s + v, 0)
  const totalExpense = monthlyExpense.reduce((s, v) => s + v, 0)
  const totalSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? Math.round(totalSavings / totalIncome * 100) : 0

  const years = [...new Set(txns.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a)
  if (!years.includes(year)) years.unshift(year)

  return (
    <Layout>
      <div className="page-enter">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Reports</h1>
          <select className="input" style={{ width: 120 }} value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary cards - 1 col on mobile, 4 on desktop */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <div className="animate-slide-up-1">
            <SummaryCard label="Total income" value={fmt(totalIncome)} color="var(--green)" emoji="💚" />
          </div>
          <div className="animate-slide-up-2">
            <SummaryCard label="Total expenses" value={fmt(totalExpense)} color="var(--red)" emoji="🔴" />
          </div>
          <div className="animate-slide-up-3">
            <SummaryCard label="Net savings" value={fmt(totalSavings)} color={totalSavings >= 0 ? 'var(--blue)' : 'var(--red)'} emoji="💰" />
          </div>
          <div className="animate-slide-up-4">
            <SummaryCard label="Savings rate" value={`${savingsRate}%`}
              color={savingsRate >= 20 ? 'var(--green)' : savingsRate >= 10 ? 'var(--amber)' : 'var(--red)'} emoji="📊" />
          </div>
        </div>

        {/* Monthly bar chart - full width */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
              Monthly overview — {year}
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['#00e5a0', 'Income'], ['#ff5c7a', 'Expenses']].map(([c, l]) => (
                <span key={l} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 200, width: '100%' }}>
            <Bar data={{
              labels: SHORT,
              datasets: [
                { label: 'Income', data: monthlyIncome, backgroundColor: 'rgba(0,229,160,0.75)', borderRadius: 4, borderSkipped: false },
                { label: 'Expenses', data: monthlyExpense, backgroundColor: 'rgba(255,92,122,0.75)', borderRadius: 4, borderSkipped: false },
              ]
            }} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  grid: { color: 'rgba(128,128,128,0.08)' },
                  ticks: { color: '#888', font: { size: 10 }, maxRotation: 0 }
                },
                y: {
                  grid: { color: 'rgba(128,128,128,0.08)' },
                  ticks: {
                    color: '#888', font: { size: 10 },
                    callback: v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'K' : v
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* Category breakdown - stack on mobile */}
        <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
          {/* Doughnut */}
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 14 }}>
              Expense breakdown
            </div>
            {catEntries.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No expense data yet</div>
            ) : (
              <div style={{ position: 'relative', height: 180, width: '100%', maxWidth: 200, margin: '0 auto' }}>
                <Doughnut data={{
                  labels: catEntries.map(([k]) => k),
                  datasets: [{ data: catEntries.map(([, v]) => v), backgroundColor: CAT_COLORS, borderWidth: 0, hoverOffset: 6 }]
                }} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  cutout: '65%',
                }} />
              </div>
            )}
          </div>

          {/* Category list */}
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 14 }}>
              By category
            </div>
            {catEntries.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>No expense data yet.</div>
            ) : catEntries.map(([cat, amt], i) => {
              const pct = Math.round(amt / totalExpense * 100)
              return (
                <div key={cat} style={{ marginBottom: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                      {cat}
                    </span>
                    <span style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      <span style={{ color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{pct}%</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{fmt(amt)}</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length], borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Layout>
  )
}
