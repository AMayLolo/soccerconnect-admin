// src/utils/supabase/server.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Create a Supabase client on the server using the request cookies.
 * We expect loginAction() to have already set:
 *   - sb-access-token
 *   - sb-refresh-token
 */
export async function createServerClientInstance(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // If we have both tokens, hydrate the session so .auth.getUser() works
  if (accessToken && refreshToken) {
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (err) {
      console.warn(
        "setSession failed in createServerClientInstance (maybe expired tokens):",
        err
      );
    }
  }

  return supabase;
}
