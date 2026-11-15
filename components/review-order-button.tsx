'use client'

import { useState } from 'react'
import { ReviewFormModal } from './review-form-modal'

export function ReviewOrderButton({ productId, productName }: { productId: string, productName: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-[10px] font-bold uppercase tracking-[.1em] text-[#b49a62] hover:text-[#1d1c1a] underline underline-offset-4 transition-colors"
      >
        Write a Review
      </button>

      <ReviewFormModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        productId={productId} 
        productName={productName} 
      />
    </>
  )
}