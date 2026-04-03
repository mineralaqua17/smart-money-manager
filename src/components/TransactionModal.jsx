import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { formatDisplayAmount, parseAmount } from '../hooks/useFormatAmount'

const CATEGORIES = {
  expense: ['Food & Drink','Transport','Housing','Shopping','Health','Entertainment','Education','Utilities','Subscription','Other'],
  income: ['Salary','Freelance','Business','Investment','Gift','Other'],
}

export default function TransactionModal({ onClose, onSaved, initial }) {
  const { user } = useAuth()
  const { currency } = useCurrency()
  const [type, setType] = useState(initial?.type || 'expense')
  const [displayAmount, setDisplayAmount] = useState(
    initial?.amount ? formatDisplayAmount(initial.amount, currency) : ''
  )
  const [form, setForm] = useState({
    description: initial?.description || '',
    category: initial?.category || CATEGORIES.expense[0],
    date: initial?.date || new Date().toISOString().split('T')[0],
    notes: initial?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplayAmount(raw ? formatDisplayAmount(raw, currency) : '')
  }

  const handleSubmit = async () => {
    const amount = parseAmount(displayAmount)
    if (!form.description || !amount || !form.date) {
      setError('Please fill all required fields.')
      return
    }
    setLoading(true)
    setError('')
    const payload = {
      user_id: user.id, type,
      description: form.description,
      amount,
      category: form.category,
      date: form.date,
      notes: form.notes,
      currency,
    }
    const { error: err } = initial?.id
      ? await supabase.from('transactions').update(payload).eq('id', initial.id)
      : await supabase.from('transactions').insert(payload)

    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved()
    onClose()
  }

  const currencySymbol = currency === 'IDR' ? 'Rp' : '$'

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} className="card animate-scale-in" style={{
        width: '100%',
        maxWidth: 460,
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 22px',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            {initial?.id ? '✏️ Edit' : '➕ New'} Transaction
          </h3>
          <button onClick={onClose} style={{
            background: 'var(--bg3)', border: 'none', color: 'var(--text2)',
            width: 30, height: 30, borderRadius: '50%', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => { setType(t); set('category', CATEGORIES[t][0]) }}
              style={{
                padding: '13px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid',
                borderColor: type === t
                  ? (t === 'income' ? 'rgba(0,229,160,0.6)' : 'rgba(255,92,122,0.6)')
                  : 'var(--border)',
                background: type === t
                  ? (t === 'income' ? 'var(--green-dim)' : 'var(--red-dim)')
                  : 'var(--bg3)',
                color: type === t
                  ? (t === 'income' ? 'var(--green)' : 'var(--red)')
                  : 'var(--text2)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
              {t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Description *</label>
            <input className="input" value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. Grocery shopping" />
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount *</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--accent)', fontSize: 14,
                fontFamily: 'var(--font-mono)', fontWeight: 600,
                pointerEvents: 'none',
              }}>{currencySymbol}</span>
              <input
                className="input"
                style={{
                  paddingLeft: currency === 'IDR' ? 36 : 26,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 17, fontWeight: 700,
                  letterSpacing: '0.3px',
                }}
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                inputMode="numeric"
              />
            </div>
            {displayAmount && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 5, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                = {currencySymbol} {displayAmount}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="label">Date *</label>
            <input className="input" type="date" value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES[type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any extra details..." />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--red-dim)', border: '1px solid rgba(255,92,122,0.2)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px',
            color: 'var(--red)', fontSize: 13, marginTop: 14,
          }}>{error}</div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn-ghost" style={{ flex: 1, padding: '12px' }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" style={{ flex: 2, padding: '12px' }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : initial?.id ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}
