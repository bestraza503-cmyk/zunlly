'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type CartItem = { 
  id: string; 
  name: string; 
  price: number; 
  image: string; 
  quantity: number;
  variant?: string; 
}

type CartContextValue = { 
  items: CartItem[]; 
  count: number; 
  total: number; 
  add: (item: Omit<CartItem, 'quantity'>) => Promise<void>; 
  remove: (id: string, variant?: string) => Promise<void>; 
  updateQuantity: (id: string, action: 'increase' | 'decrease', variant?: string) => Promise<void>; 
  clear: () => Promise<void> 
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  // ✅ Lazy initialization - sirf browser mein chalega
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null
    return createClient()
  }, [])

  // 1. Database se Cart Fetch karein
  useEffect(() => {
    if (!supabase) return
    let isMounted = true

    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        if (isMounted) {
          setItems([])
          setIsLoaded(true)
        }
        return
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          variant,
          products (id, name, price, images)
        `)
        .eq('user_id', user.id)

      if (data && isMounted) {
        const formattedCart = data.map((item: any) => ({
          id: item.products.id,
          name: item.products.name,
          price: Number(item.products.price),
          image: item.products.images?.[0] || '',
          quantity: item.quantity,
          variant: item.variant || undefined
        }))
        setItems(formattedCart)
      }
      if (isMounted) setIsLoaded(true)
    }

    fetchCart()

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchCart()
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  // 2. Add to Cart
  const add = async (item: Omit<CartItem, 'quantity'>) => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?next=/shop')
      return
    }

    setItems((current) => {
      const found = current.find((entry) => entry.id === item.id && entry.variant === item.variant)
      return found 
        ? current.map((entry) => (entry.id === item.id && entry.variant === item.variant) ? { ...entry, quantity: entry.quantity + 1 } : entry) 
        : [...current, { ...item, quantity: 1 }]
    })

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', item.id)
      .eq('variant', item.variant || null)
      .maybeSingle()

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({ 
          user_id: user.id, 
          product_id: item.id, 
          quantity: 1,
          variant: item.variant || null
        })
    }
  }

  // 3. Remove from Cart
  const remove = async (id: string, variant?: string) => {
    if (!supabase) return
    setItems((current) => current.filter((item) => !(item.id === id && item.variant === variant)))
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      let query = supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id)
      if (variant) query = query.eq('variant', variant)
      else query = query.is('variant', null)
      
      await query
    }
  }

  // 4. Update Quantity
  const updateQuantity = async (id: string, action: 'increase' | 'decrease', variant?: string) => {
    if (!supabase) return
    let newQty = 1;
    
    setItems((current) => 
      current.map((item) => {
        if (item.id === id && item.variant === variant) {
          const q = action === 'increase' ? item.quantity + 1 : Math.max(1, item.quantity - 1)
          newQty = q
          return { ...item, quantity: q }
        }
        return item
      })
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      let query = supabase.from('cart_items').update({ quantity: newQty }).eq('user_id', user.id).eq('product_id', id)
      if (variant) query = query.eq('variant', variant)
      else query = query.is('variant', null)
      
      await query
    }
  }

  // 5. Clear Cart
  const clear = async () => {
    if (!supabase) return
    setItems([])
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    }
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}