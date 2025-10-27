// src/utils/supabase/server.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client on the server, using the auth cookies we store
 * (sb-access-token / sb-refresh-token).
 *
 * This lets server components and layouts call supabase.auth.getUser()
 * consistently.
 */
export async function createServerClientInstance(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  // Create the client with no built-in cookie persistence (we're SSR)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // If we DO have both tokens, explicitly set the session so supabase.auth.getUser() works.
  // If we don't, don't call setSession(), because passing empty strings can cause type errors.
  if (accessToken && refreshToken) {
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (err) {
      console.warn(
        "setSession failed in createServerClientInstance (likely expired tokens):",
        err
      );
    }
  }

  return supabase;
}
