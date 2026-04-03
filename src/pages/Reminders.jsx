import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import Layout from '../components/Layout'

const CATEGORIES = ['Food & Drink','Transport','Housing','Shopping','Health','Entertainment','Education','Utilities','Subscription','Loan Payment','Other']

function ReminderModal({ onClose, onSaved, initial }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    amount: initial?.amount || '',
    category: initial?.category || CATEGORIES[0],
    remind_day: initial?.remind_day || 1,
    remind_email: initial?.remind_email || user?.email || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.remind_day || !form.remind_email) { setError('Please fill all required fields.'); return }
    setLoading(true)
    const payload = { ...form, user_id: user.id, amount: form.amount ? +form.amount : null, remind_day: +form.remind_day }
    const { error: err } = initial?.id
      ? await supabase.from('reminders').update(payload).eq('id', initial.id)
      : await supabase.from('reminders').insert(payload)
    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved(); onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="card fade-up" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>⏰ {initial?.id ? 'Edit' : 'New'} Reminder</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="label">Reminder title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Transport payment" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Amount (optional)</label>
              <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">Remind on day *</label>
              <input className="input" type="number" min="1" max="31" value={form.remind_day} onChange={e => set('remind_day', e.target.value)} placeholder="e.g. 3" />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Send reminder to email *</label>
            <input className="input" type="email" value={form.remind_email} onChange={e => set('remind_email', e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Any extra details..." />
          </div>
        </div>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginTop: 14, fontSize: 12, color: 'var(--accent)' }}>
          💡 Reminder will be saved now. To activate email sending, follow the <strong>EMAIL-REMINDER-SETUP.md</strong> guide in your project folder.
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 10 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Reminders() {
  const { user } = useAuth()
  const { fmt } = useCurrency()
  const [reminders, setReminders] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('remind_day')
    setReminders(data || [])
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return
    await supabase.from('reminders').delete().eq('id', id)
    load()
  }

  const toggleActive = async (id, current) => {
    await supabase.from('reminders').update({ is_active: !current }).eq('id', id)
    load()
  }

  const today = new Date().getDate()

  return (
    <Layout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Reminders</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Set email reminders for recurring expenses</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>+ Add reminder</button>
        </div>

        {/* Today's reminders */}
        {reminders.filter(r => r.remind_day === today && r.is_active).length > 0 && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.3)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>📅 Today's reminders</div>
            {reminders.filter(r => r.remind_day === today && r.is_active).map(r => (
              <div key={r.id} style={{ fontSize: 13, color: 'var(--text)', display: 'flex', justifyContent: 'space-between' }}>
                <span>• {r.title}</span>
                {r.amount && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{fmt(r.amount)}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Reminders list */}
        {reminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏰</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No reminders yet</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Set reminders for recurring bills, loan payments, or any expense</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create first reminder</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {reminders.map(r => (
              <div key={r.id} className="card" style={{ opacity: r.is_active ? 1 : 0.5, transition: 'opacity 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{r.title}</div>
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>{r.category}</span>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: r.remind_day === today ? 'var(--accent-dim)' : 'var(--bg3)',
                    border: r.remind_day === today ? '1px solid var(--accent)' : '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: r.remind_day === today ? 'var(--accent)' : 'var(--text2)',
                    fontFamily: 'var(--font-mono)', fontWeight: 600, lineHeight: 1.2,
                  }}>
                    <span style={{ fontSize: 16 }}>{r.remind_day}</span>
                    <span style={{ fontSize: 9 }}>every mo.</span>
                  </div>
                </div>
                {r.amount && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--red)', marginBottom: 8 }}>{fmt(r.amount)}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                  📧 {r.remind_email}
                  {r.description && <div style={{ marginTop: 4 }}>📝 {r.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => toggleActive(r.id, r.is_active)}>
                    {r.is_active ? '⏸ Pause' : '▶ Resume'}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => { setEditing(r); setShowModal(true) }}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => handleDelete(r.id)}>Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <ReminderModal onClose={() => { setShowModal(false); setEditing(null) }} onSaved={load} initial={editing} />}
    </Layout>
  )
}
