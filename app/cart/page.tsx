'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/cart-provider'
import { Trash2, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { items, remove, updateQuantity, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center px-5">
        <h1 className="font-serif text-4xl mb-4 text-[#292722]">Your bag is empty</h1>
        <p className="text-[#827b70] mb-8">Discover our signature fragrances and find your scent.</p>
        <Link href="/shop" className="bg-[#1d1c1a] text-white px-8 py-4 text-xs font-bold uppercase tracking-[.15em] hover:bg-[#b49a62] transition-colors">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-5 py-12 text-[#292722]">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-8">Shopping Bag</h1>
        
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.variant || ''}`} className="flex gap-4 bg-white p-4 border border-[#e6e1d9]">
                <div className="relative h-24 w-20 shrink-0 bg-[#f4f1eb]">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.variant && <p className="text-xs text-[#827b70] mt-1">Size: {item.variant}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#e6e1d9] rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)} className="px-3 py-1 hover:text-[#b49a62]">-</button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} className="px-3 py-1 hover:text-[#b49a62]">+</button>
                    </div>
                    <p className="font-bold">PKR {(Number(item.price) * item.quantity).toLocaleString('en-PK')}</p>
                  </div>
                </div>
                <button onClick={() => remove(item.id, item.variant)} className="text-gray-400 hover:text-red-500 self-start p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 border border-[#e6e1d9] h-fit">
            <h2 className="font-serif text-2xl mb-4">Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#827b70]">Subtotal</span>
              <span className="font-medium">PKR {total.toLocaleString('en-PK')}</span>
            </div>
            <div className="flex justify-between text-sm mb-6 pb-6 border-b border-[#e6e1d9]">
              <span className="text-[#827b70]">Shipping</span>
              <span className="text-[#827b70]">Calculated at checkout</span>
            </div>
            <Link href="/checkout" className="w-full bg-[#1d1c1a] text-white flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[.15em] hover:bg-[#b49a62] transition-colors">
              Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}