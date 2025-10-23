// admin-web/lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for RSC/route handlers.
 * Next 16: cookies() is async, so this function is async now.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies(); // <- MUST await in Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // In RSC, cookies are immutable; set/remove are no-ops here.
        // If you need to write cookies, do it in a Route Handler.
        set() {},
        remove() {},
      },
    }
  );
}
