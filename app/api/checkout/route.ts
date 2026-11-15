import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendOrderConfirmationEmail } from "@/lib/send-order-email"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const customerId = user ? user.id : null

    const contentType = request.headers.get("content-type") || ""
    let bodyData: any = {}
    let screenshotFile: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      bodyData = {
        customerName: formData.get('customerName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        notes: formData.get('notes'),
        paymentMethod: formData.get('paymentMethod'),
        idempotencyKey: formData.get('idempotencyKey'),
        total_amount: formData.get('total_amount'),
        items: JSON.parse(String(formData.get('items') || '[]')),
      }
      screenshotFile = formData.get('screenshot') as File | null
    } else {
      bodyData = await request.json()
    }
    
    const customerName = String(bodyData.customerName || '').trim()
    const phone = String(bodyData.phone || '').trim()
    const email = String(bodyData.email || user?.email || 'guest@zunlly.com').trim()
    const address = String(bodyData.address || '').trim()
    const city = String(bodyData.city || '').trim()
    const postalCode = String(bodyData.postalCode || '').trim()
    const notes = String(bodyData.notes || '').trim()
    const total_amount = Number(bodyData.total_amount) || 0 
    const paymentMethod = String(bodyData.paymentMethod || 'cod')
    const idempotencyKey = String(bodyData.idempotencyKey || crypto.randomUUID())
    const items = Array.isArray(bodyData.items) ? bodyData.items : []

    if (!customerName || !phone || !address || !city || !postalCode || !items.length) {
      return NextResponse.json({ error: "Please complete all required checkout fields." }, { status: 400 })
    }

    // Screenshot Upload
    let screenshotUrl = null
    if (paymentMethod === 'advance' && screenshotFile && screenshotFile.size > 0) {
      const fileExt = screenshotFile.name.split('.').pop()
      const fileName = `proof-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, screenshotFile)

      if (uploadError) {
        return NextResponse.json({ error: "Failed to upload payment screenshot." }, { status: 400 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName)
        
      screenshotUrl = publicUrl
    }

    // ✅ 1. DIRECT INSERT: Order create karo
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: total_amount, 
        status: 'pending',
        idempotency_key: idempotencyKey,
        payment_method: paymentMethod,
        email: email,
        delivery_info: { 
          customerName, phone, email, address, city, postalCode, notes, screenshot_url: screenshotUrl
        }
      })
      .select('id')
      .single()

    if (orderError) {
      console.error("❌ REAL ORDER INSERT ERROR:", orderError)
      return NextResponse.json({ error: `Database Error: ${orderError.message || 'Check terminal for details'}` }, { status: 400 })
    }

    const orderId = orderData.id
    const displayOrderNumber = orderId.slice(0, 8).toUpperCase()

    // ✅ 2. DIRECT INSERT: Order Items create karo
    const productIds = items.map((i: any) => i.product_id)
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds)

    if (productsData && productsData.length > 0) {
      const orderItemsToInsert = items.map((item: any) => {
        const product = productsData.find(p => p.id === item.product_id)
        return {
          order_id: orderId,
          product_id: item.product_id,
          product_name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          quantity: Math.floor(Number(item.quantity)),
          size: item.size || null,
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert)

      if (itemsError) {
        console.error("❌ REAL ITEMS INSERT ERROR:", itemsError)
        await supabase.from('orders').delete().eq('id', orderId)
        return NextResponse.json({ error: `Items Error: ${itemsError.message || 'Check terminal'}` }, { status: 400 })
      }
    }

    // ✅ 3. EMAIL BHEJO (Ab await kar rahe hain taake error foran dikhe)
    if (email && email !== 'guest@zunlly.com') {
      console.log("📨 Sending email to:", email);
      const emailResult = await sendOrderConfirmationEmail(email, displayOrderNumber, total_amount, customerName);
      if (!emailResult.success) {
        console.error("❌ EMAIL FAILED:", emailResult.error);
      }
    }

    return NextResponse.json({ order: { id: orderId, order_number: displayOrderNumber } }, { status: 201 })

  } catch (error: any) {
    console.error("❌ API CRASH ERROR:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}