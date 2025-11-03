import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClientInstance() {
  const cookieStore = await cookies();

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL/SUPABASE_ANON_KEY environment variables")
  }

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: async () => {}, // handled by Supabase internally
        remove: async () => {}, // handled by Supabase internally
      },
    }
  );
}
