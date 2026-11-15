'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useEffect, useState } from 'react'

export default function RevenueChart({ daily, monthly, yearly }: { daily: any[], monthly: any[], yearly: any[] }) {
  const [isMounted, setIsMounted] = useState(false)
  const [filter, setFilter] = useState<'daily' | 'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="h-[350px] flex items-center justify-center">Loading chart...</div>

  // ✅ Filter ke hisaab se data select karo
  const activeData = filter === 'daily' ? daily : filter === 'yearly' ? yearly : monthly

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-[#eadfce] p-6 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-serif text-xl text-[#3b281c]">Performance Overview</h2>
          <p className="text-sm text-[#8a6b58]">Revenue, Orders & Views ka comparison</p>
        </div>

        {/* ✅ FILTER BUTTONS */}
        <div className="flex bg-[#fbf7f1] border border-[#eadfce] rounded-xl p-1">
          <button onClick={() => setFilter('daily')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'daily' ? 'bg-[#3b281c] text-white shadow-sm' : 'text-[#8a6b58] hover:text-[#3b281c]'}`}>Daily</button>
          <button onClick={() => setFilter('monthly')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'monthly' ? 'bg-[#3b281c] text-white shadow-sm' : 'text-[#8a6b58] hover:text-[#3b281c]'}`}>Monthly</button>
          <button onClick={() => setFilter('yearly')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === 'yearly' ? 'bg-[#3b281c] text-white shadow-sm' : 'text-[#8a6b58] hover:text-[#3b281c]'}`}>Yearly</button>
        </div>
      </div>

      <div className="w-full h-[350px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c46c3b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#c46c3b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b281c" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b281c" stopOpacity={0}/>
              </linearGradient>
              {/* ✅ Views ke liye Blue Color */}
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eadfce" />
            
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a6b58', fontSize: 12 }} dy={10} />
            
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#8a6b58', fontSize: 12 }} tickFormatter={(value) => `Rs ${value}`} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8a6b58', fontSize: 12 }} />
            
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #eadfce' }} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            {/* ✅ 3 Lines: Revenue, Orders, Views */}
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#c46c3b" strokeWidth={3} fill="url(#colorRevenue)" name="Revenue (Rs)" />
            <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#3b281c" strokeWidth={3} fill="url(#colorOrders)" name="Orders" />
            <Area yAxisId="right" type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} fill="url(#colorViews)" name="Views" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}