import { useEffect, useState } from 'react'
import { formatDisplayAmount, parseAmount } from '../hooks/useFormatAmount'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import Layout from '../components/Layout'

const LOAN_TYPES = ['Personal Loan','KPR / Mortgage','KTA','Koperasi','Credit Card','Car Loan','Student Loan','Business Loan','Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function LoanModal({ onClose, onSaved, initial }) {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [displayTotal, setDisplayTotal] = useState(
    initial?.total_amount ? formatDisplayAmount(initial.total_amount) : ''
  )
  const [displayRemaining, setDisplayRemaining] = useState(
    initial?.remaining_amount ? formatDisplayAmount(initial.remaining_amount) : ''
  )
  const [displayMonthly, setDisplayMonthly] = useState(
    initial?.monthly_payment ? formatDisplayAmount(initial.monthly_payment) : ''
  )
  const [form, setForm] = useState({
    name: initial?.name || '',
    loan_type: initial?.loan_type || LOAN_TYPES[0],
    interest_rate: initial?.interest_rate || '',
    lender: initial?.lender || '',
    start_date: initial?.start_date || '',
    due_date: initial?.due_date || '',
    notes: initial?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAmountChange = (setter) => (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setter(raw ? formatDisplayAmount(raw, currency) : '')
  }

  const handleSubmit = async () => {
    const total = parseAmount(displayTotal)
    const remaining = parseAmount(displayRemaining)
    const monthly = parseAmount(displayMonthly)

    // Validate only required fields
    if (!form.name) { setError('Please enter a loan name.'); return }
    if (!total) { setError('Please enter the total amount.'); return }
    if (!remaining && remaining !== 0) { setError('Please enter the remaining amount.'); return }

    setLoading(true)
    const payload = {
      ...form,
      user_id: user.id,
      currency,
      total_amount: total,
      remaining_amount: remaining,
      monthly_payment: monthly || null,
      interest_rate: +form.interest_rate || null,
    }

    const { error: err } = initial?.id
      ? await supabase.from('loans').update(payload).eq('id', initial.id)
      : await supabase.from('loans').insert(payload)

    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved()
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} className="card animate-scale-in" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            {initial?.id ? '✏️ Edit' : '➕ Add'} Loan
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', width: 30, height: 30, borderRadius: '50%', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Loan name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. BCA KPR" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Loan type</label>
            <select className="input" value={form.loan_type} onChange={e => set('loan_type', e.target.value)}>
              {LOAN_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Total amount *</label>
            <input className="input" style={{ fontFamily: 'var(--font-mono)' }} inputMode="numeric"
              value={displayTotal} onChange={handleAmountChange(setDisplayTotal)} placeholder="0" />
          </div>
          <div>
            <label className="label">Remaining amount *</label>
            <input className="input" style={{ fontFamily: 'var(--font-mono)' }} inputMode="numeric"
              value={displayRemaining} onChange={handleAmountChange(setDisplayRemaining)} placeholder="0" />
          </div>
          <div>
            <label className="label">Monthly payment</label>
            <input className="input" style={{ fontFamily: 'var(--font-mono)' }} inputMode="numeric"
              value={displayMonthly} onChange={handleAmountChange(setDisplayMonthly)} placeholder="0" />
          </div>
          <div>
            <label className="label">Interest rate (%)</label>
            <input className="input" type="number" value={form.interest_rate} onChange={e => set('interest_rate', e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Lender / Bank</label>
            <input className="input" value={form.lender} onChange={e => set('lender', e.target.value)} placeholder="e.g. BCA" />
          </div>
          <div>
            <label className="label">Start date</label>
            <input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Due date</label>
            <input className="input" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,92,122,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginTop: 14 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : initial?.id ? 'Save changes' : 'Add loan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Payment checklist - shows months from start_date to due_date
function PaymentChecklist({ loan, userId, onUpdate }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)

  // Build month list from start_date to due_date
  const getLoanMonths = () => {
    const months = []
    const start = loan.start_date ? new Date(loan.start_date) : new Date()
    const end = loan.due_date ? new Date(loan.due_date) : new Date()
    const now = new Date()

    // Start from start month, end at due month (max 36 months to be safe)
    let cur = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    let count = 0

    while (cur <= last && count < 36) {
      months.push({
        month: cur.getMonth() + 1,
        year: cur.getFullYear(),
        label: MONTHS[cur.getMonth()],
        isPast: cur < new Date(now.getFullYear(), now.getMonth(), 1),
        isCurrent: cur.getMonth() === now.getMonth() && cur.getFullYear() === now.getFullYear(),
      })
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      count++
    }
    return months
  }

  useEffect(() => {
    supabase.from('loan_payments').select('*').eq('loan_id', loan.id)
      .then(({ data }) => setPayments(data || []))
  }, [loan.id])

  const isPaid = (month, year) => payments.some(p => p.month === month && p.year === year)

  const togglePayment = async (month, year) => {
    if (loading) return
    setLoading(true)
    const alreadyPaid = isPaid(month, year)
    const monthlyAmt = loan.monthly_payment || 0

    if (alreadyPaid) {
      // Uncheck → add back to remaining
      await supabase.from('loan_payments').delete()
        .eq('loan_id', loan.id).eq('month', month).eq('year', year)
      setPayments(prev => prev.filter(p => !(p.month === month && p.year === year)))
      // Increase remaining
      if (monthlyAmt > 0) {
        const newRemaining = Math.min(loan.total_amount, (loan.remaining_amount || 0) + monthlyAmt)
        await supabase.from('loans').update({ remaining_amount: newRemaining }).eq('id', loan.id)
      }
    } else {
      // Check → reduce remaining
      const { data } = await supabase.from('loan_payments').insert({
        loan_id: loan.id, user_id: userId, month, year
      }).select().single()
      if (data) setPayments(prev => [...prev, data])
      // Decrease remaining
      if (monthlyAmt > 0) {
        const newRemaining = Math.max(0, (loan.remaining_amount || 0) - monthlyAmt)
        await supabase.from('loans').update({ remaining_amount: newRemaining }).eq('id', loan.id)
      }
    }

    setLoading(false)
    onUpdate?.() // Refresh parent so remaining updates live
  }

  const loanMonths = getLoanMonths()
  const paidCount = loanMonths.filter(m => isPaid(m.month, m.year)).length
  const totalMonths = loanMonths.length

  if (!loan.start_date && !loan.due_date) {
    return (
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
        Set start & due date to enable payment checklist
      </div>
    )
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
          Payment checklist
        </div>
        <span className={`badge ${paidCount === totalMonths ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
          {paidCount}/{totalMonths} paid
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
        {loanMonths.map(({ month, year, label, isCurrent }) => {
          const paid = isPaid(month, year)
          return (
            <button key={`${month}-${year}`}
              onClick={() => togglePayment(month, year)}
              disabled={loading}
              style={{
                padding: '8px 4px',
                borderRadius: 'var(--radius-xs)',
                border: '2px solid',
                borderColor: paid ? 'rgba(0,229,160,0.5)' : isCurrent ? 'var(--accent)' : 'var(--border)',
                background: paid ? 'var(--green-dim)' : isCurrent ? 'var(--accent-dim)' : 'var(--bg3)',
                color: paid ? 'var(--green)' : isCurrent ? 'var(--accent)' : 'var(--text3)',
                fontSize: 10, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all 0.18s',
                position: 'relative',
              }}>
              <span style={{ fontSize: 14 }}>{paid ? '✓' : isCurrent ? '◉' : '○'}</span>
              <span>{label}</span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>{year}</span>
            </button>
          )
        })}
      </div>
      {loan.monthly_payment > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
          ✓ Checking a month reduces remaining balance by {loan.monthly_payment?.toLocaleString('id-ID')}
        </div>
      )}
    </div>
  )
}

export default function Loans() {
  const { user } = useAuth()
  const { fmt } = useCurrency()
  const [loans, setLoans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [tab, setTab] = useState('active')

  const load = async () => {
    const { data } = await supabase.from('loans').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setLoans(data || [])
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this loan?')) return
    await supabase.from('loans').delete().eq('id', id)
    load()
  }

  const markPaid = async (id) => {
    await supabase.from('loans').update({ status: 'paid', remaining_amount: 0 }).eq('id', id)
    load()
  }

  const filtered = loans.filter(l => l.status === tab)
  const totalRemaining = loans.filter(l => l.status === 'active').reduce((s, l) => s + l.remaining_amount, 0)
  const totalMonthly = loans.filter(l => l.status === 'active').reduce((s, l) => s + (l.monthly_payment || 0), 0)

  return (
    <Layout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Loans</h1>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>+ Add loan</button>
        </div>

        {/* Summary */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { label: 'Total owed', value: fmt(totalRemaining), color: 'var(--amber)', emoji: '💰' },
            { label: 'Monthly payments', value: fmt(totalMonthly), color: 'var(--red)', emoji: '📅' },
            { label: 'Active loans', value: loans.filter(l => l.status === 'active').length, color: 'var(--blue)', emoji: '📋' },
          ].map(m => (
            <div key={m.label} className="card" style={{ borderLeft: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 6 }}>{m.emoji} {m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['active', 'paid'].map(t => (
            <button key={t} onClick={() => setTab(t)} className="btn"
              style={{ background: tab === t ? 'var(--bg3)' : 'transparent', border: '1px solid', borderColor: tab === t ? 'var(--border2)' : 'var(--border)', color: tab === t ? 'var(--text)' : 'var(--text2)', textTransform: 'capitalize' }}>
              {t} {t === 'active' ? `(${loans.filter(l=>l.status==='active').length})` : `(${loans.filter(l=>l.status==='paid').length})`}
            </button>
          ))}
        </div>

        {/* Loan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', gridColumn: '1/-1' }}>
              No {tab} loans.{tab === 'active' && <button onClick={() => setShowModal(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: 6, fontSize: 13 }}>Add one →</button>}
            </div>
          ) : filtered.map(l => {
            const total = l.total_amount || 1
            const pct = Math.min(100, Math.max(0, Math.round((1 - l.remaining_amount / total) * 100)))
            return (
              <div key={l.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{l.name}</div>
                    <span className="badge badge-amber" style={{ fontSize: 10 }}>{l.loan_type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--amber)', fontWeight: 700 }}>{fmt(l.remaining_amount)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>remaining</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--green))', borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10 }}>
                  {pct}% paid · Total {fmt(l.total_amount)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                  {l.lender && <span>🏦 {l.lender}</span>}
                  {l.monthly_payment && <span>📅 {fmt(l.monthly_payment)}/mo</span>}
                  {l.interest_rate && <span>% {l.interest_rate}% p.a.</span>}
                  {l.due_date && <span>⏳ {new Date(l.due_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>}
                </div>

                {/* Payment checklist */}
                {l.status === 'active' && (
                  <PaymentChecklist loan={l} userId={user.id} onUpdate={load} />
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {l.status === 'active' && (
                    <button className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }} onClick={() => markPaid(l.id)}>✓ Mark paid off</button>
                  )}
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 11 }} onClick={() => { setEditing(l); setShowModal(true) }}>Edit</button>
                  <button className="btn btn-danger" style={{ flex: 1, fontSize: 11 }} onClick={() => handleDelete(l.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {showModal && <LoanModal onClose={() => { setShowModal(false); setEditing(null) }} onSaved={load} initial={editing} />}
    </Layout>
  )
}
