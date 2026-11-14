'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'PKR' | 'USD' | 'GBP' | 'AED' | 'SAR'

interface CurrencyContextType {
  currency: Currency
  countryCode: string
  setCountry: (code: string, currency: Currency) => void
  formatPrice: (priceInPKR: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Exchange Rates (Base: PKR)
const EXCHANGE_RATES: Record<Currency, number> = {
  PKR: 1,
  USD: 0.0036, // 1 PKR = 0.0036 USD
  GBP: 0.0028,
  AED: 0.013,
  SAR: 0.013,
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PKR: 'PKR',
  USD: '$',
  GBP: '£',
  AED: 'AED',
  SAR: 'SAR',
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [countryCode, setCountryCode] = useState('PK')

  // Save to LocalStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('zunlly-currency') as Currency
    const savedCountry = localStorage.getItem('zunlly-country')
    if (savedCurrency && savedCountry) {
      setCurrency(savedCurrency)
      setCountryCode(savedCountry)
    }
  }, [])

  const setCountry = (code: string, newCurrency: Currency) => {
    setCountryCode(code)
    setCurrency(newCurrency)
    localStorage.setItem('zunlly-currency', newCurrency)
    localStorage.setItem('zunlly-country', code)
  }

  // ✅ FIX: Safe formatPrice (NaN Handling)
  const formatPrice = (priceInPKR: number) => {
    // Agar price number nahi hai ya undefined hai toh 0 maan lo
    const safePrice = Number(priceInPKR) || 0
    
    // Currency ke hisaab se convert karo
    const converted = safePrice * EXCHANGE_RATES[currency]
    const symbol = CURRENCY_SYMBOLS[currency]
    
    // Agar PKR hai toh decimals hata do (clean look)
    if (currency === 'PKR') {
      return `${symbol} ${Math.round(converted).toLocaleString('en-PK')}`
    }
    
    // Baqi currencies ke liye 2 decimal points lagao
    return `${symbol} ${converted.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, countryCode, setCountry, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}