// src/utils/auth.ts
// Centralized server-side auth utilities for the admin dashboard

import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";

/**
 * We only ever call this on the server. It uses the service role key so it can
 * validate any user's token.
 *
 * IMPORTANT: SERVICE ROLE KEY MUST NEVER SHIP TO THE BROWSER.
 * Keep this file server-only (no "use client").
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "[auth.ts] Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

// This client can call admin endpoints. Server only.
function getServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * getCurrentUser()
 *
 * Reads the auth cookies we set during loginAction (sb-access-token / sb-refresh-token),
 * validates them against Supabase using the service client, and returns a Supabase User
 * or null if we can't authenticate.
 */
export async function getCurrentUser(): Promise<User | null> {
  const adminClient = getServiceClient();

  // Next.js 16 types cookies() as returning Promise<ReadonlyRequestCookies> in some layers,
  // but at runtime here it's usable sync. So we cast it to shut up TypeScript.
  const cookieStore = (cookies() as unknown) as {
    get(name: string): { value: string } | undefined;
  };

  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    // no auth cookies set
    return null;
  }

  // 1. Try validating the access token directly
  const { data: userResp, error: userErr } = await adminClient.auth.getUser(
    accessToken
  );

  if (userErr || !userResp.user) {
    // access token is invalid/expired -> try refreshing using the refresh token
    const {
      data: refreshResp,
      error: refreshErr,
    } = await adminClient.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshErr || !refreshResp.session?.access_token) {
      // refresh also failed, user is effectively logged out
      return null;
    }

    // we got a fresh session -> return that user
    return refreshResp.session.user;
  }

  // access token was fine
  return userResp.user;
}

/**
 * requireAdmin()
 *
 * Call this inside a server component / route to enforce auth.
 * If the user is missing or not an admin, you decide what to do (redirect, throw, etc).
 *
 * For now we only check "is there a user". You can extend it later with RLS, roles, etc.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    // not logged in
    return { ok: false as const, user: null };
  }

  // TODO: add real role check (e.g. check user.app_metadata.role === "admin")
  return { ok: true as const, user };
}
