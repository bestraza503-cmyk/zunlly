'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    const supabase = createClient()
    
    async function track() {
      // Session check (taake bar bar load pe insert na ho)
      const sessionKey = `session_viewed_${productId}`
      if (sessionStorage.getItem(sessionKey)) return

      const lastViewed = localStorage.getItem(`viewed_${productId}`)
      const now = new Date().getTime()
      
      // Agar pichle 24 ghante mein nahi dekha
      if (!lastViewed || now - parseInt(lastViewed) > 24 * 60 * 60 * 1000) {
        const todayDate = new Date().toISOString().split('T')[0]

        // ✅ UPSERT use karo (Yeh duplicate hone pe error nahi dega)
        const { error } = await supabase
          .from('product_views')
          .upsert(
            { product_id: productId, view_date: todayDate },
            { onConflict: 'product_id, view_date', ignoreDuplicates: true }
          )
        
        if (error) {
          console.error("Error inserting view:", error)
        } else {
          console.log("View tracked successfully!")
        }
        
        localStorage.setItem(`viewed_${productId}`, now.toString())
        sessionStorage.setItem(sessionKey, 'true')
      }
    }
    
    track()
  }, [productId])

  return null
}