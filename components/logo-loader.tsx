'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function LogoLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8f6f0]">
      
      {/* Logo with Pulse Effect */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 animate-pulse"
      >
        <Image 
          src="/logo.png" 
          alt="ZUNLLY" 
          width={140} 
          height={50} 
          className="object-contain" 
        />
      </motion.div>

      {/* Golden Progress Line */}
      <div className="h-1 w-48 overflow-hidden rounded-full bg-[#e6e1d9]">
        <motion.div 
          className="h-full bg-[#b49a62]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[.25em] text-[#827b70]">
        Loading
      </p>
    </div>
  )
}