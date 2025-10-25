import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Exported helper — use this in your server actions and routes
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {
          // no-op for SSR
        },
        remove() {
          // no-op for SSR
        },
      },
    }
  );
}
