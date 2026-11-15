'use client'

import { useState } from 'react'
import { ReviewFormModal } from './review-form-modal'
import { motion } from 'framer-motion'

export function AccountReviewButton({ 
  productId, 
  productName, 
  orderId // ✅ Order ID prop mein add kiya
}: { 
  productId: string, 
  productName: string, 
  orderId: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.button 
        onClick={() => setIsOpen(true)} 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[10px] font-bold uppercase tracking-wider text-[#c46c3b] hover:text-[#a55626] underline underline-offset-4 transition-colors"
      >
        Write a Review
      </motion.button>

      <ReviewFormModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        productId={productId} 
        productName={productName} 
        orderId={orderId} // ✅ Modal ko orderId pass ki
      />
    </>
  )
}