'use client'
import { useState, useEffect } from 'react'

export function CountdownTimer({ endDate }: { endDate: string }) {
  // ✅ State mein 'd' (days) add kar diya
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = new Date(endDate).getTime() - now

      if (distance < 0) {
        clearInterval(timer)
        setExpired(true)
        return
      }

      // ✅ Days calculate karne ka formula
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ d: days, h: hours, m: minutes, s: seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  if (expired) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-red-600 font-bold bg-red-50 px-3 sm:px-4 py-2 rounded-lg border border-red-200">
      <span className="mr-1">Offer Ends In:</span>
      
      {/* ✅ Agar 1 din se zyada bacha hai to Days show honge */}
      {timeLeft.d > 0 && (
        <>
          <span className="bg-red-600 text-white px-2 py-1 rounded text-sm min-w-[32px] text-center">
            {timeLeft.d}d
          </span>
          <span>:</span>
        </>
      )}

      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm min-w-[32px] text-center">
        {String(timeLeft.h).padStart(2, '0')}h
      </span>
      <span>:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm min-w-[32px] text-center">
        {String(timeLeft.m).padStart(2, '0')}m
      </span>
      <span>:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm min-w-[32px] text-center">
        {String(timeLeft.s).padStart(2, '0')}s
      </span>
    </div>
  )
}