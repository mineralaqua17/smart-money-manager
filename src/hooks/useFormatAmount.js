export function formatDisplayAmount(value, currency = 'IDR') {
  if (!value && value !== 0) return ''
  const num = parseInt(String(value).replace(/\D/g, ''), 10)
  if (isNaN(num)) return ''
  if (currency === 'IDR') return num.toLocaleString('id-ID')
  return num.toLocaleString('en-US')
}

export function parseAmount(displayValue) {
  return parseInt(String(displayValue).replace(/\D/g, ''), 10) || 0
}
