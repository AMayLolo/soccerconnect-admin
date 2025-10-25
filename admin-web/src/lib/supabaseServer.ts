// lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client for RSC / route handlers (Next.js 16 compatible).
 * cookies() is async in Next 16, so this function must also be async.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies() // ✅ must await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {}, // no-ops in RSC
        remove() {},
      },
    }
  )
}
