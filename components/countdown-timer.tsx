'use client'
import { useState, useEffect } from 'react'

export function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
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

      setTimeLeft({
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (expired) return null

  return (
    <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-200">
      <span>Offer Ends In:</span>
      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">{timeLeft.h}h</span>:
      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">{timeLeft.m}m</span>:
      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">{timeLeft.s}s</span>
    </div>
  )
}