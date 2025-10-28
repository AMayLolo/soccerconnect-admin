// src/lib/supabaseServer.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use inside Next.js 16+ Server Components.
 * Uses the async `cookies()` API for secure SSR sessions.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies(); // <-- ✅ await is required in Next 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored — cookies() are read-only in RSC but writable in route handlers
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignored
          }
        },
      },
    }
  );
}
