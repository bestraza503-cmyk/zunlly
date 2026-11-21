'use server'

import { createClient } from '@/lib/supabase/server'

export async function trackOrder(query: string) {
  const supabase = await createClient()
  
  const cleanQuery = query.replace('#', '').trim().toLowerCase()

  // 🔥 YAHAN CHANGE HAI: 'total' ki jagah 'total_amount' likh diya hai
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, created_at') 
    .order('created_at', { ascending: false })

  if (ordersError) {
    console.log('Orders Error:', ordersError)
    return { success: false, message: 'Server error. Please check terminal.' }
  }

  const matchedOrder = orders?.find((o) => {
    if (o.order_number && o.order_number.toLowerCase() === cleanQuery) return true
    if (o.id.toLowerCase().startsWith(cleanQuery)) return true
    return false
  })

  if (!matchedOrder) {
    return { success: false, message: 'Order not found. Please check your Order ID/Number.' }
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_name')
    .eq('order_id', matchedOrder.id)

  if (itemsError) {
    console.log('Items Error:', itemsError)
    return { success: false, message: 'Server error fetching items.' }
  }

  // 🔥 YAHAN BHI CHANGE HAI: total_amount ko total banaya hai frontend ke liye
  const finalOrder = {
    ...matchedOrder,
    total: Number(matchedOrder.total_amount) || 0, // total_amount ko total mein map kiya
    order_items: orderItems || []
  }

  return { success: true, order: finalOrder }
}