import { createServerClient, createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ✅ Shared constants
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server client for SSR, route handlers, etc.
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      setAll: () => {},
    },
  });
}

// Browser client for useEffect or client components
export function createClientSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
