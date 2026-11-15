'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle2, User, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ReviewSuccessModal } from '@/components/review-success-modal'

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [canReview, setCanReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchReviews()
    checkUserPurchase()
  }, [productId])

  // ✅ Fetch Reviews
  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`*, profiles(full_name)`)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      
      if (error) {
        const { data: simpleData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
        
        if (simpleData) setReviews(simpleData)
      } else {
        if (data) setReviews(data)
      }
    } catch (err) {
      console.error("Reviews fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Check karo ke user ne product khareeda hai aur review diya hai ya nahi
  async function checkUserPurchase() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Pehle check karo ke user ne yeh product PEHLE SE REVIEW kiya hai ya nahi
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle()

      // ✅ Agar pehle se review diya hai, toh form mat dikhao
      if (existingReview) {
        setCanReview(false)
        return
      }

      // 2. Agar review nahi diya, toh check karo ke user ne product khareeda hai ya nahi
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('customer_id', user.id)

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('id')
          .eq('product_id', productId)
          .in('order_id', orderIds)
          .limit(1)

        // Agar khareeda hai aur review nahi diya, toh form dikhao
        if (orderItems && orderItems.length > 0) {
          setCanReview(true)
        }
      }
    } catch (err) {
      console.error("Purchase check error:", err)
    }
  }

  // ✅ Submit Review
  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      // Product page se orderId nahi mil rahi, isliye hum isko khali bhejenge
      // Aur API mein check laga denge ke agar order_id na ho toh koi baat nahi
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, reviewText })
      })

      const textData = await res.text()
      let data

      try {
        data = JSON.parse(textData)
      } catch (err) {
        throw new Error(`Server error (Status: ${res.status}).`)
      }

      if (!res.ok) throw new Error(data.error || "Failed to submit review")

      setIsSuccessOpen(true)
      setReviewText('')
      setCanReview(false)
      fetchReviews()

    } catch (err: any) {
      setMessage(err.message || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <>
      <div id="review" className="border-t border-[#e6e1d9] pt-10 mt-10">
        <h2 className="font-serif text-2xl mb-6">Customer Reviews</h2>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-8">
          <div className="text-4xl font-serif">{avgRating}</div>
          <div>
            <div className="flex text-[#b49a62]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} fill={s <= Number(avgRating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {/* Review Form */}
        {canReview && (
          <form onSubmit={submitReview} className="bg-white border border-[#e6e1d9] p-6 mb-8">
            <h3 className="font-medium mb-4">Write a Review</h3>
            <div className="flex text-[#b49a62] mb-4 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={24} onClick={() => setRating(star)} fill={star <= rating ? 'currentColor' : 'none'} className="mr-1" />
              ))}
            </div>
            <textarea
              required
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full border border-[#e6e1d9] p-3 text-sm mb-4 outline-none focus:border-[#b49a62]"
            />
            <button type="submit" disabled={submitting} className="bg-[#1d1c1a] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#b49a62] disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            
            {message && (
              <div className="mt-4 flex items-start gap-2 text-sm p-3 rounded-md bg-red-50 text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{message}</p>
              </div>
            )}
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-[#e6e1d9] pb-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#efece6] flex items-center justify-center">
                    <User size={14} className="text-[#b49a62]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {review.profiles?.full_name || 'Verified Buyer'}
                      <CheckCircle2 size={12} className="text-green-600" />
                    </p>
                    <p className="text-[10px] text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex text-[#b49a62]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} fill={s <= review.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#827b70] mt-2">{review.review_text}</p>
            </div>
          ))}
          {reviews.length === 0 && !loading && (
            <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>

      <ReviewSuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />
    </>
  )
}