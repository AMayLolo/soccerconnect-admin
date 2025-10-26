// src/utils/supabase/server.ts
//
// Server-side Supabase helpers for Next.js 16
// - Handles async cookies() correctly
// - Exposes:
//     getUserClient()     -> RLS-scoped client for current signed-in user
//     getServiceClient()  -> service-role client (admin / no RLS)
//     getServerUser()     -> convenience to read the current user
//
// IMPORTANT: This file must never be imported into client components.

import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";

// ─────────────────────────────────────────
// ENV VAR HELPERS
// ─────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// We don't throw at module top level (that can break Vercel build-time eval).
// We assert right before using each client.

function assertEnvForUserClient() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error(
      "[supabase/server.ts] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
}

function assertEnvForServiceClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "[supabase/server.ts] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
}

// ─────────────────────────────────────────
// COOKIE READER (Next 16 cookies() is async)
// ─────────────────────────────────────────

async function readAuthCookies() {
  // Next 16 returns a Promise from cookies()
  const cookieStore = await cookies();

  const safeGet = (name: string): string | undefined => {
    try {
      const c = cookieStore.get(name);
      return c?.value;
    } catch (err) {
      console.warn(
        `[supabase/server.ts] failed to read cookie "${name}":`,
        (err as Error).message
      );
      return undefined;
    }
  };

  const accessToken = safeGet("sb-access-token");
  const refreshToken = safeGet("sb-refresh-token");

  return { accessToken, refreshToken };
}

// ─────────────────────────────────────────
// getUserClient()
// Creates a per-request Supabase client that acts as *this user*
// by hydrating the session from cookies.
// Row-level security (RLS) applies like in the browser.
// ─────────────────────────────────────────

export async function getUserClient() {
  assertEnvForUserClient();

  const { accessToken, refreshToken } = await readAuthCookies();

  // create a regular anon client
  const client = createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // If we actually have a session, inject it.
  // In supabase-js v2, you do this with setSession({ access_token, refresh_token })
  if (accessToken && refreshToken) {
    try {
      const { error } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.warn(
          "[supabase/server.ts] setSession error in getUserClient():",
          error.message
        );
      }
    } catch (err) {
      console.warn(
        "[supabase/server.ts] setSession threw in getUserClient():",
        (err as Error).message
      );
    }
  }

  return client;
}

// ─────────────────────────────────────────
// getServiceClient()
// Admin / service-role client. Bypasses RLS.
// NEVER send this to the browser.
// ─────────────────────────────────────────

export function getServiceClient() {
  assertEnvForServiceClient();

  const client = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

// ─────────────────────────────────────────
// getServerUser()
// Quick helper to fetch the current signed-in user object (or null).
// Uses SERVICE ROLE to decode the access token so it works server-side.
// ─────────────────────────────────────────

export async function getServerUser(): Promise<User | null> {
  assertEnvForServiceClient();

  const { accessToken, refreshToken } = await readAuthCookies();

  // no cookies at all -> not logged in
  if (!accessToken || !refreshToken) {
    return null;
  }

  // With service client, we can call getUser(accessToken)
  const svc = getServiceClient();
  const { data, error } = await svc.auth.getUser(accessToken);

  if (error || !data.user) {
    // access token could be expired — try refresh with refresh_token
    const { data: refreshed, error: refreshErr } = await svc.auth.refreshSession(
      {
        refresh_token: refreshToken,
      }
    );

    if (refreshErr || !refreshed.session?.user) {
      return null;
    }

    return refreshed.session.user;
  }

  return data.user;
}
