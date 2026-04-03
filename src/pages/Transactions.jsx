import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCurrency } from '../context/CurrencyContext'
import Layout from '../components/Layout'
import TransactionModal from '../components/TransactionModal'

export default function Transactions() {
  const { user } = useAuth()
  const { fmt } = useCurrency()
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setTxns(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await supabase.from('transactions').delete().eq('id', id)
    load()
  }

  const filtered = txns
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <Layout>
      <div className="page-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Transactions</h1>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>+ Add transaction</button>
        </div>

        {/* Summary row */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total income', value: fmt(totalIncome), color: 'var(--green)' },
            { label: 'Total expenses', value: fmt(totalExpense), color: 'var(--red)' },
            { label: 'Net', value: fmt(totalIncome - totalExpense), color: totalIncome >= totalExpense ? 'var(--blue)' : 'var(--red)' },
          ].map(m => (
            <div key={m.label} className="card" style={{ borderLeft: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <input className="input" style={{ maxWidth: 240 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          {['all', 'income', 'expense'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn"
              style={{
                background: filter === f ? 'var(--bg3)' : 'transparent',
                border: '1px solid',
                borderColor: filter === f ? 'var(--border2)' : 'var(--border)',
                color: filter === f ? 'var(--text)' : 'var(--text2)',
                textTransform: 'capitalize',
              }}>{f}</button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No transactions found.</div>
          ) : filtered.map((t, i) => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.type === 'income' ? 'var(--green-dim)' : 'var(--red-dim)',
                  color: t.type === 'income' ? 'var(--green)' : 'var(--red)',
                  fontSize: 14, fontWeight: 600,
                }}>
                  {t.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {t.category} · {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {t.notes && <> · <span style={{ color: 'var(--text3)' }}>{t.notes}</span></>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: t.type === 'income' ? 'var(--green)' : 'var(--red)', textAlign: 'right' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount).replace(/^[Rp$\s]+/, '')}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                    onClick={() => { setEditing(t); setShowModal(true) }}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }}
                    onClick={() => handleDelete(t.id)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSaved={load}
          initial={editing}
        />
      )}
    </Layout>
  )
}
