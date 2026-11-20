'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrderData(null)

    const { data, error } = await supabase
      .from('orders')
      .select('id, status, tracking_number, tracking_status, created_at, total_amount')
      .eq('id', orderId)
      .single()

    if (error || !data) {
      setError('Order nahi mila. Please apna sahi Order ID enter karein.')
    } else {
      setOrderData(data)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f4ebe1] py-20 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <Image src="/logo.png" alt="ZUNLLY Logo" width={100} height={35} className="object-contain" />
          </Link>
          <h1 className="font-serif text-4xl text-[#3e2723] mb-2">Track Your Order</h1>
          <p className="text-[#7a6b5d]">Enter your Order ID to see the current status.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-[#ebe2d5] mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter your Order ID (e.g. 123e4567-e89b...)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 border border-gray-300 p-3.5 rounded-md focus:outline-none focus:border-[#a67c52] text-sm"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#3e2723] text-white px-8 py-3.5 rounded-md font-bold uppercase tracking-wider hover:bg-[#a67c52] transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-center border border-red-200 mb-8">
            {error}
          </div>
        )}

        {/* Result Section */}
        {orderData && (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-[#ebe2d5]">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b5d] mb-1">Order ID</p>
                <p className="font-mono text-sm text-[#3e2723] break-all">{orderData.id}</p>
              </div>
              <span className="bg-[#f4ebe1] text-[#a67c52] px-3 py-1 text-xs font-bold uppercase rounded-full">
                {orderData.tracking_status || orderData.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b5d] mb-1">Order Date</p>
                <p className="text-sm text-[#3e2723]">{new Date(orderData.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b5d] mb-1">Total Amount</p>
                <p className="text-sm font-bold text-[#3e2723]">PKR {orderData.total_amount}</p>
              </div>
            </div>

            {orderData.tracking_number && (
              <div className="bg-[#fcf9f2] p-4 rounded-md border border-[#e3d8c8]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7a6b5d] mb-1">Tracking Number</p>
                <p className="font-mono text-lg font-bold text-[#a67c52]">{orderData.tracking_number}</p>
                <p className="text-xs text-[#7a6b5d] mt-2">Use this number on the courier's website for more details.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}