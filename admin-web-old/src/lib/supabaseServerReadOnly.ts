// lib/supabaseServerReadOnly.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Read-only Supabase client for Server Components (no cookie writes).
 * Use for fetching public or low-risk data where session mutation isn’t needed.
 */
export async function getSupabaseServerReadOnly() {
  const cookieStore = await cookies() // ✅ Next 16 requires await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},   // no-ops to prevent mutation warnings
        remove() {},
      },
    }
  )
}
