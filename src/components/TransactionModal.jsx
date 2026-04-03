import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import { formatDisplayAmount, parseAmount } from '../hooks/useFormatAmount'

const CATEGORIES = {
  expense: ['Food & Drink','Transport','Housing','Shopping','Health','Entertainment','Education','Utilities','Subscription','Other'],
  income: ['Salary','Freelance','Business','Investment','Gift','Other'],
}

const CAT_EMOJI = {
  'Food & Drink': '🍜', 'Transport': '🚗', 'Housing': '🏠', 'Shopping': '🛍',
  'Health': '💊', 'Entertainment': '🎬', 'Education': '📚', 'Utilities': '⚡',
  'Subscription': '📱', 'Other': '📌', 'Salary': '💼', 'Freelance': '💻',
  'Business': '🏢', 'Investment': '📈', 'Gift': '🎁',
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
    if (!form.description || !amount || !form.date) { setError('Please fill all required fields.'); return }
    setLoading(true); setError('')
    const payload = { user_id: user.id, type, description: form.description, amount, category: form.category, date: form.date, notes: form.notes, currency }
    const { error: err } = initial?.id
      ? await supabase.from('transactions').update(payload).eq('id', initial.id)
      : await supabase.from('transactions').insert(payload)
    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved(); onClose()
  }

  const currencySymbol = currency === 'IDR' ? 'Rp' : '$'

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(12px)' }}>
      <div onClick={e => e.stopPropagation()} className="animate-scale-in" style={{ background: 'var(--glass)', backdropFilter: 'blur(30px) saturate(200%)', WebkitBackdropFilter: 'blur(30px) saturate(200%)', border: '1px solid var(--border2)', borderRadius: 24, padding: '24px 22px', width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.3px' }}>
            {initial?.id ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg3)', border: 'none', color: 'var(--text2)', width: 30, height: 30, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>✕</button>
        </div>

        {/* Type Toggle - iOS segmented control style */}
        <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 12, padding: 3, marginBottom: 22, gap: 3 }}>
          {['income', 'expense'].map(t => (
            <button key={t} onClick={() => { setType(t); set('category', CATEGORIES[t][0]) }}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
                background: type === t ? (t === 'income' ? 'var(--green)' : 'var(--red)') : 'transparent',
                color: type === t ? '#fff' : 'var(--text2)',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: type === t ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}>
              {t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Description</label>
            <input className="input" style={{ borderRadius: 12 }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Grocery shopping" />
          </div>
          <div>
            <label className="label">Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: type === 'income' ? 'var(--green)' : 'var(--red)', fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 700, pointerEvents: 'none' }}>{currencySymbol}</span>
              <input className="input" style={{ paddingLeft: currency === 'IDR' ? 36 : 26, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, borderRadius: 12, color: type === 'income' ? 'var(--green)' : 'var(--red)' }}
                value={displayAmount} onChange={handleAmountChange} placeholder="0" inputMode="numeric" />
            </div>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" style={{ borderRadius: 12 }} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {CATEGORIES[type].map(c => (
                <button key={c} onClick={() => set('category', c)} style={{
                  padding: '10px 8px', borderRadius: 12, border: '1px solid',
                  borderColor: form.category === c ? (type === 'income' ? 'var(--green)' : 'var(--blue)') : 'var(--border)',
                  background: form.category === c ? (type === 'income' ? 'var(--green-dim)' : 'var(--blue-dim)') : 'var(--bg3)',
                  color: form.category === c ? (type === 'income' ? 'var(--green)' : 'var(--blue)') : 'var(--text2)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ fontSize: 18 }}>{CAT_EMOJI[c] || '📌'}</span>
                  <span>{c.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" style={{ borderRadius: 12 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any extra details..." />
          </div>
        </div>

        {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,69,58,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginTop: 14 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button className="btn btn-ghost" style={{ flex: 1, borderRadius: 14 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2, padding: '13px', borderRadius: 14 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : initial?.id ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}
