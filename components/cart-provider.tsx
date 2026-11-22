'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
}

type CartContextType = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  remove: (id: string, variant?: string) => void
  updateQuantity: (id: string, quantity: number, variant?: string) => void
  clear: () => void
  count: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // LocalStorage se cart load karo
  useEffect(() => {
    const saved = localStorage.getItem('zunlly-cart')
    if (saved) {
      try { setItems(JSON.parse(saved)) } catch (e) {}
    }
    setIsMounted(true)
  }, [])

  // Cart update hone pe LocalStorage mein save karo
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zunlly-cart', JSON.stringify(items))
    }
  }, [items, isMounted])

  const add = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === newItem.id && i.variant === newItem.variant)
      if (existing) {
        return current.map((i) =>
          i.id === newItem.id && i.variant === newItem.variant
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...current, { ...newItem, quantity }]
    })
  }

  const remove = (id: string, variant?: string) => {
    setItems((current) => current.filter((i) => !(i.id === id && i.variant === variant)))
  }

  const updateQuantity = (id: string, quantity: number, variant?: string) => {
    if (quantity < 1) return
    setItems((current) =>
      current.map((i) => (i.id === id && i.variant === variant ? { ...i, quantity } : i))
    )
  }

  const clear = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQuantity, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}