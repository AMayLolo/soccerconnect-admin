// src/utils/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase server client bound to Next.js cookies.
 * Works across @supabase/ssr versions 0.5–0.7+ and Next.js 15–16.
 */
export async function createServerClientInstance() {
  // Next.js 16 cookies() is async
  const cookieStore = await cookies();

  // Hybrid cookie adapter (works for both legacy & current Supabase SSR APIs)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from Next.js
        getAll: () => Array.from(cookieStore.getAll()),

        // Write methods are no-ops in SSR-only contexts
        setAll: () => {},
      },
    }
  );

  return supabase;
}
