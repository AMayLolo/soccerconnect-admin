import { cookies } from "next/headers";
import { createServerClient as createSupabaseClient } from "@supabase/ssr";

export async function createServerClient() {
  const cookieStore = await cookies(); // 👈 await is required in Next 15+

  return createSupabaseClient(
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
}
