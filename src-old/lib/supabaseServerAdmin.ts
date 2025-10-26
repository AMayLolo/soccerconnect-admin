// lib/supabaseServerAdmin.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client with elevated privileges.
 * 
 * Use this only in trusted server actions or route handlers.
 * If you later lock writes behind RLS, swap in the SERVICE_ROLE key below.
 */
export async function getSupabaseServerAdmin() {
  const cookieStore = await cookies() // required in Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // change to SERVICE_ROLE if needed
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {}, // RSCs can’t mutate cookies
        remove() {},
      },
    }
  )
}
