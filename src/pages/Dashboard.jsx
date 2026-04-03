import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import Layout from '../components/Layout'
import TransactionModal from '../components/TransactionModal'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function MetricCard({ label, value, sub, colorClass, icon }) {
  return (
    <div className={`metric-card ${colorClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>{label}</div>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, marginBottom: 4, wordBreak: 'break-all' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { fmt } = useCurrency()
  const [txns, setTxns] = useState([])
  const [loans, setLoans] = useState([])
  const [paidLoanIds, setPaidLoanIds] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const load = async () => {
    const { data: t } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
    const { data: l } = await supabase.from('loans').select('*').eq('user_id', user.id).eq('status', 'active')
    const now = new Date()
    const { data: lp } = await supabase.from('loan_payments').select('*')
      .eq('user_id', user.id)
      .eq('month', now.getMonth() + 1)
      .eq('year', now.getFullYear())
    setTxns(t || [])
    setLoans(l || [])
    setPaidLoanIds((lp || []).map(p => p.loan_id))
  }

  useEffect(() => { load() }, [])

  const monthTxns = txns.filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth
  })

  const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  // Monthly loan payments - only loans where this month is NOT yet paid
  const currentMonthPaid = (loanId) => paidLoanIds.includes(loanId)
  const monthlyLoanPayment = loans
    .filter(l => !currentMonthPaid(l.id))
    .reduce((s, l) => s + (l.monthly_payment || 0), 0)
  const paidThisMonth = loans
    .filter(l => currentMonthPaid(l.id))
    .reduce((s, l) => s + (l.monthly_payment || 0), 0)
  const totalLoanRemaining = loans.reduce((s, l) => s + l.remaining_amount, 0)
  // Net = income - expenses - loan payments
  const net = income - expense - monthlyLoanPayment

  // 6-month chart
  const chartLabels = []
  const chartIncome = []
  const chartExpense = []
  const chartLoan = []
  for (let i = 5; i >= 0; i--) {
    let m = viewMonth - i; let y = viewYear
    if (m < 0) { m += 12; y-- }
    chartLabels.push(MONTHS[m])
    const mt = txns.filter(t => { const d = new Date(t.date); return d.getFullYear() === y && d.getMonth() === m })
    chartIncome.push(mt.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))
    chartExpense.push(mt.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))
    chartLoan.push(monthlyLoanPayment)
  }

  const changeMonth = (dir) => {
    let m = viewMonth + dir; let y = viewYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setViewMonth(m); setViewYear(y)
  }

  const recent = [...monthTxns].slice(0, 6)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>{greeting()} 👋</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>
              {FULL_MONTHS[viewMonth]} {viewYear}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', width: 28, height: 28, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', width: 28, height: 28, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add transaction</button>
        </div>

        {/* Metrics */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <MetricCard label="Income" value={fmt(income)} colorClass="metric-income" icon="💚" sub="this month" />
          <MetricCard label="Expenses" value={fmt(expense)} colorClass="metric-expense" icon="🔴" sub="this month" />
          <MetricCard label="Loan payments" value={fmt(monthlyLoanPayment)} colorClass="metric-loan" icon="🟡"
            sub={`${loans.length} active · ${fmt(totalLoanRemaining)} total`} />
          <MetricCard label="Net balance" value={fmt(net)} colorClass="metric-balance" icon={net >= 0 ? '🔵' : '🔴'}
            sub={net >= 0 ? 'You\'re on track!' : 'Over budget'} />
        </div>

        {/* Chart + Loans */}
        <div className="section-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>6-month overview</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[['#00e5a0','Income'],['#ff5c7a','Expenses'],['#ffb347','Loans']].map(([c,l]) => (
                  <span key={l} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', height: 190 }}>
              <Bar data={{
                labels: chartLabels,
                datasets: [
                  { label: 'Income', data: chartIncome, backgroundColor: 'rgba(0,229,160,0.75)', borderRadius: 5, borderSkipped: false },
                  { label: 'Expenses', data: chartExpense, backgroundColor: 'rgba(255,92,122,0.75)', borderRadius: 5, borderSkipped: false },
                  { label: 'Loan payments', data: chartLoan, backgroundColor: 'rgba(255,179,71,0.75)', borderRadius: 5, borderSkipped: false },
                ]
              }} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 11 } } },
                  y: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#888', font: { size: 10 }, callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v } }
                }
              }} />
            </div>
          </div>

          {/* Active Loans summary */}
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 14 }}>Active loans</div>
            {loans.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No active loans 🎉</div>
            ) : (
              <>
                {loans.slice(0, 4).map(l => {
                  const pct = l.total_amount > 0 ? Math.round((1 - l.remaining_amount / l.total_amount) * 100) : 0
                  return (
                    <div key={l.id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                        <span style={{ fontWeight: 500 }}>{l.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: 12 }}>{fmt(l.remaining_amount)}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))', borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{pct}% paid · {l.monthly_payment ? fmt(l.monthly_payment)+'/mo' : ''}</div>
                    </div>
                  )
                })}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>Total remaining</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontWeight: 600 }}>{fmt(totalLoanRemaining)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                    <span style={{ color: 'var(--text2)' }}>Monthly payments</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>{fmt(monthlyLoanPayment)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Transactions - grouped by type */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>Recent transactions</div>
            <a href="/transactions" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</a>
          </div>
          {recent.length === 0 ? (
            <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
              No transactions this month.{' '}
              <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13 }}>Add one →</button>
            </div>
          ) : (
            <>
              {/* Income group */}
              {recent.filter(t => t.type === 'income').length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Income</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--green-dim)' }} />
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>
                      +{fmt(recent.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)).replace(/^(Rp\s|\$)/,'')}
                    </span>
                  </div>
                  {recent.filter(t => t.type === 'income').map((t, i, arr) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--green)' }}>↑</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>
                        +{fmt(t.amount).replace(/^(Rp\s|\$)/,'')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Expense group */}
              {recent.filter(t => t.type === 'expense').length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Expenses</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--red-dim)' }} />
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--red)' }}>
                      -{fmt(recent.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)).replace(/^(Rp\s|\$)/,'')}
                    </span>
                  </div>
                  {recent.filter(t => t.type === 'expense').map((t, i, arr) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--red)' }}>↓</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>
                        -{fmt(t.amount).replace(/^(Rp\s|\$)/,'')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSaved={load} />}
    </Layout>
  )
}
