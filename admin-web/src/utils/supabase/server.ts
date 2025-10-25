import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * ✅ Compatible with older Supabase SSR API (3-argument style)
 * Works in async Edge runtime
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  return supabase;
}
