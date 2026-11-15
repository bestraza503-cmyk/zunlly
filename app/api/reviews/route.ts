import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // 1. Check User Login
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Please login to submit a review." },
        { status: 401 }
      )
    }

    // 2. Get Data from Body
    const body = await req.json()
    const { productId, rating, reviewText, orderId } = body

    // ✅ orderId OPTIONAL hai — Product Page se nahi aati
    if (!productId || !rating || !reviewText) {
      return NextResponse.json(
        { error: "Product, rating and review text are required." },
        { status: 400 }
      )
    }

    // 3. ✅ PURCHASE VERIFY — sirf DELIVERED orders ke liye
    let orderItem: any = null
    let orderError: any = null

    if (orderId) {
      // Account Page flow: specific order mein check karo
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, orders!inner(customer_id, status)")
        .eq("order_id", orderId)
        .eq("product_id", productId)
        .eq("orders.customer_id", user.id)
        .eq("orders.status", "delivered") // ✅ DELIVERED ONLY
        .maybeSingle()

      orderItem = data
      orderError = error
    } else {
      // Product Page flow: user ke kisi bhi delivered order mein yeh product dhoondo
      const { data, error } = await supabase
        .from("order_items")
        .select("id, order_id, orders!inner(customer_id, status)")
        .eq("product_id", productId)
        .eq("orders.customer_id", user.id)
        .eq("orders.status", "delivered") // ✅ DELIVERED ONLY
        .order("id", { ascending: false }) // latest order pehle
        .limit(1)
        .maybeSingle()

      orderItem = data
      orderError = error
    }

    if (orderError) {
      console.error("Order Check Error:", orderError)
      return NextResponse.json(
        { error: "Database error while verifying purchase." },
        { status: 500 }
      )
    }

    if (!orderItem) {
      return NextResponse.json(
        {
          error:
            "You can only review products from your delivered orders.",
        },
        { status: 403 }
      )
    }

    // ✅ Final order_id nikaal lo
    const finalOrderId = orderId || orderItem.order_id

    // 4. ✅ DUPLICATE CHECK — sirf product + user pe (order_id pe NAHI)
    //    Yeh dono jagah se (Dashboard ya Product Page) apply hota hai
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (reviewCheckError) {
      console.error("Review Check Error:", reviewCheckError)
      return NextResponse.json(
        { error: "Database error while checking existing review." },
        { status: 500 }
      )
    }

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 400 }
      )
    }

    // 5. Insert Review
    const { data, error } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        user_id: user.id,
        order_id: finalOrderId,
        rating: Number(rating),
        review_text: reviewText,
      })
      .select()
      .single()

    if (error) {
      console.error("Insert Review Error:", error)

      // ✅ Database unique constraint se aane wala duplicate error handle
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already reviewed this product." },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, review: data }, { status: 201 })
  } catch (error: any) {
    console.error("Server Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}