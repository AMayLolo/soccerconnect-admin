// src/utils/auth.ts
// server-only helpers for auth

import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "[auth.ts] Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

/**
 * We only ever call this on the server. It uses the service role key so it can
 * validate any user's token.
 *
 * IMPORTANT: SERVICE ROLE KEY MUST NEVER SHIP TO THE BROWSER.
 * Keep this file server-only (no "use client").
 */
function getServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get the currently logged-in user (or null if not logged in).
 *
 * Reads the auth cookies we set during login, validates them with Supabase,
 * and returns the user.
 */
export async function getCurrentUser(): Promise<User | null> {
  /**
   * cookies() is typed weirdly in Next.js 16 (Promise<ReadonlyRequestCookies>)
   * but at runtime it's sync and has get(name).value.
   *
   * We'll cast it to something with a .get method to fix both TS and runtime.
   */
  const cookieStore = (cookies() as unknown) as {
    get(name: string):
      | {
          value: string;
        }
      | undefined;
  };

  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return null;
  }

  // now validate the access token with Supabase using the service role key
  const adminClient = getServiceClient();

  // We can call getUser() with the bearer token by manually injecting Authorization
  // into the fetch that supabase uses under the hood. Easiest way is to hit the auth endpoint directly.
  // But supabase-js doesn't expose a "getUserFromToken" helper, so we do this:
  const { data, error } = await adminClient.auth.getUser(accessToken);

  if (error) {
    console.error("[getCurrentUser] getUser error:", error.message);
    return null;
  }

  return data.user ?? null;
}
