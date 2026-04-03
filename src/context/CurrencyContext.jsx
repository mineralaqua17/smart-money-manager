import { createContext, useContext, useState } from 'react'

const CurrencyContext = createContext({})

export const CURRENCIES = {
  IDR: { symbol: 'Rp', code: 'IDR', locale: 'id-ID', name: 'Indonesian Rupiah' },
  USD: { symbol: '$',  code: 'USD', locale: 'en-US', name: 'US Dollar' },
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('smm_currency') || 'IDR'
  )

  const changeCurrency = (code) => {
    setCurrency(code)
    localStorage.setItem('smm_currency', code)
  }

  const fmt = (amount) => {
    const cur = CURRENCIES[currency]
    if (currency === 'IDR') {
      return 'Rp ' + Math.round(amount).toLocaleString('id-ID')
    }
    return new Intl.NumberFormat(cur.locale, {
      style: 'currency', currency: cur.code, minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, fmt, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
