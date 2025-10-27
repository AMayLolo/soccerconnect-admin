// src/utils/auth.ts
/**
 * Server-side auth helpers for Next.js app-router.
 *
 * Exports:
 *  - getCurrentUser(): returns Supabase user object or null
 *  - requireCurrentUser(): throws redirect to /login if no user (useful in server actions/pages)
 *
 * This implementation uses your project helper `createServerClientInstance()`
 * which should create a Supabase server client bound to the incoming request cookies.
 *
 * If your helper lives in a different path, update the import below.
 */

import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/utils/supabase/server";

// You can optionally type the user as SupabaseUser if you have @supabase/supabase-js types.
type SupabaseUser = any;

/**
 * Return currently authenticated user (server-side).
 * - Uses createServerClientInstance() which should be implemented to read cookies
 *   and create a Supabase server client (see your existing project helper).
 *
 * Returns user object or null.
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  try {
    const supabase = await createServerClientInstance();

    // Supabase v2: use auth.getUser()
    // Response shape: { data: { user }, error }
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // If token expired or other auth error, treat as not logged in
      console.warn("getCurrentUser supabase.auth.getUser error:", error.message);
      return null;
    }

    if (!user) return null;

    return user;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

/**
 * Require a logged-in user. If not logged in, redirect to /login.
 * Useful inside server components / server actions when you must enforce auth.
 */
export async function requireCurrentUser(): Promise<SupabaseUser> {
  const user = await getCurrentUser();
  if (!user) {
    // You can append the next param or return path if you want to redirect back
    redirect(`/login`);
    // redirect throws and halts further server rendering
  }
  return user;
}
