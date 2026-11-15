'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  orderId: string // ✅ Order ID add kiya
}

export function ReviewFormModal({ isOpen, onClose, productId, productName, orderId }: ReviewFormModalProps) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          rating, 
          reviewText, 
          orderId // ✅ API ko orderId bheja
        })
      })
      
      const textData = await res.text()
      let data
      
      try { 
        data = JSON.parse(textData) 
      } catch { 
        throw new Error("Server error. Please try again.") 
      }

      if (!res.ok) throw new Error(data.error || "Failed to submit review")

      // ✅ Success!
      setIsSuccess(true)
      
      // 2.5 seconds baad modal band karo aur page refresh karo
      setTimeout(() => {
        onClose()
        router.refresh() 
      }, 2500)

    } catch (err: any) {
      setMessage(err.message || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    onClose()
    setTimeout(() => {
      setRating(5)
      setReviewText('')
      setMessage('')
      setIsSuccess(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={handleClose} 
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" 
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md bg-white p-6 shadow-2xl rounded-2xl"
          >
            {!isSuccess && (
              <button 
                onClick={handleClose} 
                className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            )}

            {isSuccess ? (
              <div className="text-center py-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 mb-6"
                >
                  <CheckCircle2 size={40} />
                </motion.div>
                <h3 className="font-serif text-3xl text-gray-900 mb-3">Thank You!</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your review has been submitted successfully. We truly appreciate your feedback!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 pr-8">
                  <h3 className="font-serif text-2xl text-[#1d1c1a] mb-1">Write a Review</h3>
                  <p className="text-sm text-gray-500">{productName}</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="flex text-[#b49a62] mb-6 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={32} 
                        onClick={() => setRating(star)} 
                        fill={star <= rating ? 'currentColor' : 'none'} 
                        className="mr-1 hover:scale-110 transition-transform" 
                      />
                    ))}
                  </div>

                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this fragrance..."
                    className="w-full border border-gray-300 p-3 text-sm mb-4 outline-none focus:border-[#b49a62] rounded-md resize-none"
                  />

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-[#1d1c1a] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#b49a62] disabled:opacity-50 transition-colors rounded-md"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>

                  {message && (
                    <div className="mt-4 flex items-start gap-2 text-sm p-3 rounded-md bg-red-50 text-red-600 border border-red-200">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <p>{message}</p>
                    </div>
                  )}
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}