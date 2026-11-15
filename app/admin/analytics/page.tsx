import { createClient } from '@/lib/supabase/server'
import RevenueChart from '@/components/admin/revenue-chart'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 1. Delivered orders fetch karo
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total, total_amount, status, created_at')
    .eq('status', 'delivered')

  // ✅ 2. Views fetch karo (Naya)
  const { data: views } = await supabase
    .from('product_views')
    .select('created_at')

  // 3. Cards ke liye calculation
  const deliveredRevenue = orders?.reduce((sum, order) => sum + Number(order.total || order.total_amount || 0), 0) || 0
  const deliveredOrders = orders?.length || 0
  const totalViews = views?.length || 0

  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('total, total_amount')
    .eq('status', 'pending')
    
  const pendingCOD = pendingOrders?.reduce((sum, order) => sum + Number(order.total || order.total_amount || 0), 0) || 0

  // 4. Data Calculations (Daily, Monthly, Yearly)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const dailyData = []
  const monthlyData = []
  const yearlyData = []

  // --- A. DAILY (Pichle 7 din) ---
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const targetDay = d.getDate()
    const targetMonth = d.getMonth()
    
    let rev = 0
    let ords = 0
    let vws = 0 // ✅

    orders?.forEach((order) => {
      const orderDate = new Date(order.created_at)
      if (orderDate.getDate() === targetDay && orderDate.getMonth() === targetMonth) {
        rev += Number(order.total || order.total_amount || 0)
        ords += 1
      }
    })

    views?.forEach((view) => {
      const viewDate = new Date(view.created_at)
      if (viewDate.getDate() === targetDay && viewDate.getMonth() === targetMonth) {
        vws += 1
      }
    })

    dailyData.push({
      name: `${targetDay} ${months[targetMonth]}`,
      revenue: rev,
      orders: ords,
      views: vws // ✅ Add kiya
    })
  }

  // --- B. MONTHLY (Pichle 6 mahine) ---
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const targetMonth = d.getMonth()

    let rev = 0
    let ords = 0
    let vws = 0 // ✅

    orders?.forEach((order) => {
      const orderDate = new Date(order.created_at)
      if (orderDate.getMonth() === targetMonth) {
        rev += Number(order.total || order.total_amount || 0)
        ords += 1
      }
    })

    views?.forEach((view) => {
      const viewDate = new Date(view.created_at)
      if (viewDate.getMonth() === targetMonth) {
        vws += 1
      }
    })

    monthlyData.push({
      name: months[targetMonth],
      revenue: rev,
      orders: ords,
      views: vws // ✅ Add kiya
    })
  }

  // --- C. YEARLY (Pichle 5 saal) ---
  for (let i = 4; i >= 0; i--) {
    const d = new Date()
    const targetYear = d.getFullYear() - i

    let rev = 0
    let ords = 0
    let vws = 0 // ✅

    orders?.forEach((order) => {
      const orderDate = new Date(order.created_at)
      if (orderDate.getFullYear() === targetYear) {
        rev += Number(order.total || order.total_amount || 0)
        ords += 1
      }
    })

    views?.forEach((view) => {
      const viewDate = new Date(view.created_at)
      if (viewDate.getFullYear() === targetYear) {
        vws += 1
      }
    })

    yearlyData.push({
      name: targetYear.toString(),
      revenue: rev,
      orders: ords,
      views: vws // ✅ Add kiya
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="font-serif text-4xl mb-8 text-[#3b281c]">Analytics</h1>

      {/* TOP CARDS (Ab 4 hain) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ✅ Total Views Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
          <p className="text-sm font-medium text-[#8a6b58] mb-2">Total Views</p>
          <p className="font-serif text-4xl text-[#3b281c]">
            {totalViews.toLocaleString('en-PK')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
          <p className="text-sm font-medium text-[#8a6b58] mb-2">Delivered revenue</p>
          <p className="font-serif text-4xl text-[#3b281c]">
            Rs {deliveredRevenue.toLocaleString('en-PK')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
          <p className="text-sm font-medium text-[#8a6b58] mb-2">Pending COD</p>
          <p className="font-serif text-4xl text-[#3b281c]">
            Rs {pendingCOD.toLocaleString('en-PK')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#eadfce] p-6">
          <p className="text-sm font-medium text-[#8a6b58] mb-2">Delivered orders</p>
          <p className="font-serif text-4xl text-[#3b281c]">
            {deliveredOrders}
          </p>
        </div>
      </div>

      {/* ✅ GRAPH COMPONENT KO TEENO DATA BHEJ DIYE */}
      <RevenueChart 
        daily={dailyData} 
        monthly={monthlyData} 
        yearly={yearlyData} 
      />

    </div>
  )
}