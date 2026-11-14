'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Link as LinkIcon, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
}

export function ShareModal({ isOpen, onClose, productName }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out ${productName} on ZUNLLY!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank')
  const shareFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank')
  const shareTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share this product</h3>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex justify-center gap-6 mb-8">
              {/* WhatsApp */}
              <button onClick={shareWhatsApp} className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium text-gray-600">WhatsApp</span>
              </button>

              {/* Facebook (✅ SVG Use Kiya) */}
              <button onClick={shareFacebook} className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-[#1877F2]/10 text-[#1877F2] rounded-full flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600">Facebook</span>
              </button>

              {/* Twitter (✅ SVG Use Kiya) */}
              <button onClick={shareTwitter} className="group flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-black/5 text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-600">Twitter</span>
              </button>
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              <LinkIcon size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                value={currentUrl} 
                readOnly 
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate" 
              />
              <button 
                onClick={handleCopyLink} 
                className={`px-4 py-2 rounded-md text-xs font-bold transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                {copied ? <span className="flex items-center gap-1"><CheckCircle2 size={14} /> Copied</span> : 'Copy'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}