'use client'

import { useState } from 'react'
import { trackOrder } from '@/app/actions/track-order'
import { Search, Loader2, Package, Truck, CheckCircle2, Clock, MapPin, Box, ArrowLeft } from 'lucide-react'
import Link from 'next/link' // 🔥 Link import kiya back button ke liye

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    const res = await trackOrder(orderId.trim())
    
    if (res.success && res.order) {
      setOrder(res.order)
    } else {
      setError(res.message || 'Something went wrong.')
    }
    
    setLoading(false)
  }

  const getStatusStep = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s === 'pending') return 1
    if (s === 'processing') return 2
    if (s === 'shipped') return 3
    if (s === 'out for delivery') return 4
    if (s === 'delivered') return 5
    return 1 
  }

  const currentStep = order ? getStatusStep(order.status) : 0

  const estDeliveryDate = order ? new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

  const displayAmount = order?.total ? Number(order.total).toLocaleString('en-PK') : '0'

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center selection:bg-[#c46c3b] selection:text-white">
      
      {/* 🔥 BACK TO HOME BUTTON */}
      <div className="w-full max-w-4xl mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#8a6b58] hover:text-[#c46c3b] transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-4xl">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="font-serif text-4xl sm:text-5xl text-[#3b281c]">Track Your Order</h1>
          <p className="mt-3 text-sm sm:text-base text-[#8a6b58] max-w-lg mx-auto">
            Stay updated on your order's journey from our store to your doorstep.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-12">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Order ID (e.g. 59BE7CE5)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-full border border-[#eadfce] bg-white pl-5 pr-4 py-3.5 text-sm text-[#3b281c] shadow-sm outline-none transition-all focus:border-[#c46c3b] focus:ring-2 focus:ring-[#c46c3b]/20"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-[#c46c3b] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#a55626] hover:shadow-lg disabled:pointer-events-none disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
            {loading ? 'Tracking...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-4 text-center text-sm font-medium text-red-600 border border-red-100 animate-in fade-in">
            {error}
          </div>
        )}

        {order && (
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#eadfce] animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#fbf7f1] pb-6 mb-8 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#8a6b58] font-semibold mb-1">Order Number</p>
                <p className="font-serif text-3xl text-[#3b281c]">{order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}</p>
                <p className="text-sm text-[#8a6b58] mt-1 flex items-center gap-1">
                  <Clock size={14} /> Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-[#fbf7f1] px-5 py-3 rounded-2xl border border-[#eadfce]">
                <p className="text-xs uppercase tracking-widest text-[#8a6b58] font-semibold mb-1">
                  Total Amount
                </p>
                <p className="font-semibold text-lg text-[#c46c3b]">PKR {displayAmount}</p>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="font-serif text-xl text-[#3b281c] mb-8">Order Journey</h3>
              
              <div className="relative flex justify-between items-start">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-[#eadfce] -translate-y-1/2 z-0" />
                
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-[#c46c3b] -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                  style={{ width: currentStep > 1 ? `${((currentStep - 1) / 4) * 100}%` : '0%' }}
                />

                {[
                  { label: 'Order Placed', icon: Box, step: 1 },
                  { label: 'Processing', icon: Clock, step: 2 },
                  { label: 'Shipped', icon: Truck, step: 3 },
                  { label: 'Out for Delivery', icon: MapPin, step: 4 },
                  { label: 'Delivered', icon: CheckCircle2, step: 5 },
                ].map((s) => {
                  const isActive = currentStep >= s.step
                  const isCurrent = currentStep === s.step
                  const Icon = s.icon
                  
                  return (
                    <div key={s.step} className="relative z-10 flex flex-col items-center gap-3 w-1/5 text-center">
                      <div className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 bg-white
                        ${isActive ? 'border-[#c46c3b] text-[#c46c3b]' : 'border-[#eadfce] text-[#c0b2a3]'}
                        ${isCurrent ? 'ring-4 ring-[#c46c3b]/20 scale-110 shadow-sm' : ''}
                      `}>
                        {isActive && !isCurrent ? <CheckCircle2 size={18} className="text-[#c46c3b]" /> : <Icon size={18} />}
                      </div>
                      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider leading-tight ${isActive ? 'text-[#3b281c]' : 'text-[#8a6b58]'}`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#fbf7f1]/50 p-5 rounded-2xl border border-[#eadfce]">
                <h3 className="font-semibold text-[#3b281c] mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-[#c46c3b]" /> Estimated Delivery
                </h3>
                <p className="font-medium text-[#3b281c]">{estDeliveryDate}</p>
              </div>

              <div>
                <h3 className="font-semibold text-[#3b281c] mb-3 flex items-center gap-2">
                  <Package size={18} className="text-[#c46c3b]" /> Items in this order
                </h3>
                <ul className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.order_items?.map((item: any) => (
                    <li key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#fbf7f1] shadow-sm">
                      <span className="text-sm font-medium text-[#3b281c] line-clamp-2">{item.product_name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  )
}