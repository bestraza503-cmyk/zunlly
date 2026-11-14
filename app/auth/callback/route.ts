import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/account'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Agar code successfully exchange ho gaya (koi error nahi aaya)
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin))
    }
  }

  // Agar code nahi mila ya error aaya, toh wapas login page pe bhejo error ke sath
  return NextResponse.redirect(new URL('/login?error=Could not authenticate', url.origin))
}