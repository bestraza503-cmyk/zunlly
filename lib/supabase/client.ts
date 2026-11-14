import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error(
        'Supabase URL ya Key missing hai. Check karein ke .env.local mein NEXT_PUBLIC_SUPABASE_URL aur NEXT_PUBLIC_SUPABASE_ANON_KEY mojood hain.'
      )
    }

    client = createBrowserClient(url, key)
  }
  return client
}