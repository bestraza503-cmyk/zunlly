'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Heart, X } from 'lucide-react'
import { useEffect } from 'react'

export type ToastType = 'cart' | 'wishlist'

interface ToastProps {
  message: string
  type: ToastType
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  // ✅ Speed aur bhi fast ki (1.5 seconds)
  const DURATION = 1500 

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, DURATION)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-[380px] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl border border-white/20 bg-white/10"
        >
          {/* Content Container */}
          <div className="relative p-4 flex items-center gap-4 z-10">
            
            {/* Animated Icon */}
            <div className="relative flex-shrink-0">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.05 }}
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-inner
                  ${type === 'cart' ? 'bg-gradient-to-br from-[#d4b87a] to-[#b49a62]' : 'bg-gradient-to-br from-red-400 to-red-600'}`}
              >
                {type === 'cart' ? (
                  <CheckCircle2 size={24} className="text-white" />
                ) : (
                  <Heart size={24} className="text-white fill-white" />
                )}
              </motion.div>
              {/* Pulse Ring */}
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${type === 'cart' ? 'bg-[#b49a62]' : 'bg-red-500'}`} />
            </div>

            {/* Text Area */}
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-[#1a1a1a] tracking-wide">
                {type === 'cart' ? 'Added to Bag Successfully' : 'Saved to Wishlist'}
              </h4>
              <p className="text-[12px] text-gray-700 font-medium line-clamp-1 mt-0.5">
                {message}
              </p>
            </div>

            {/* Close Button */}
            <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors p-1 bg-white/50 rounded-full hover:bg-white">
              <X size={16} />
            </button>
          </div>

          {/* ✅ Progress Bar (Super Fast) */}
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: DURATION / 1000, ease: 'linear' }}
            className={`h-1 ${type === 'cart' ? 'bg-[#b49a62]' : 'bg-red-500'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}