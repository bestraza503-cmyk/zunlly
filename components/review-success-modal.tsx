'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface ReviewSuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReviewSuccessModal({ isOpen, onClose }: ReviewSuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <button onClick={onClose} className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-800 transition-colors">
              <X size={20} />
            </button>

            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 mb-6"
            >
              <CheckCircle2 size={40} />
            </motion.div>

            <h2 className="font-serif text-3xl text-gray-900 mb-3">Thank You!</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              Your review has been submitted successfully. We truly appreciate your feedback — it helps us create a better experience for you and others.
            </p>

            <button 
              onClick={onClose}
              className="w-full bg-[#1d1c1a] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b49a62] transition-colors rounded-md"
            >
              Continue Shopping
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}