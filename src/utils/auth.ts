// src/utils/auth.ts
//
// SERVER-ONLY AUTH HELPERS
//
// - Reads sb-access-token / sb-refresh-token from cookies (Next 16 async cookies())
// - Uses the service role key ONLY on the server to validate the user
// - getCurrentUser(): returns Supabase user or null
// - requireUser(): redirects to /login if not logged in
//
// IMPORTANT: Do not import this from Client Components.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type User } from "@supabase/supabase-js";

// -------------------------------------------------------------
// ENVIRONMENT VARIABLES (typed + runtime safe)
// -------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "[auth.ts] Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

// After verifying, tell TS they are guaranteed strings
const SUPABASE_URL_STR = SUPABASE_URL as string;
const SERVICE_ROLE_KEY_STR = SERVICE_ROLE_KEY as string;

// -------------------------------------------------------------
// Create a *server-only* Supabase client
// -------------------------------------------------------------
function getServiceClient() {
  return createClient(SUPABASE_URL_STR, SERVICE_ROLE_KEY_STR, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// -------------------------------------------------------------
// Read cookies (Next 16 async cookies() API)
// -------------------------------------------------------------
async function readAuthCookies() {
  // In Next 16, cookies() must be awaited in Server Components / Actions
  const cookieStore = await cookies();

  const safeRead = (name: string): string | undefined => {
    try {
      const c = cookieStore.get(name);
      return c?.value;
    } catch (err) {
      console.warn(`[auth.ts] Failed to read cookie "${name}":`, (err as Error).message);
      return undefined;
    }
  };

  const accessToken = safeRead("sb-access-token");
  const refreshToken = safeRead("sb-refresh-token");

  return { accessToken, refreshToken };
}

// -------------------------------------------------------------
// getCurrentUser(): non-throwing login check
// -------------------------------------------------------------
export async function getCurrentUser(): Promise<User | null> {
  const { accessToken, refreshToken } = await readAuthCookies();

  // No cookies at all → not logged in
  if (!accessToken || !refreshToken) {
    return null;
  }

  const supabaseServer = getServiceClient();

  // 1️⃣ Validate current access token
  const { data: userResult, error: userErr } = await supabaseServer.auth.getUser(accessToken);
  if (!userErr && userResult.user) {
    return userResult.user;
  }

  // 2️⃣ Try refresh token if access expired
  const { data: refreshed, error: refreshErr } = await supabaseServer.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (!refreshErr && refreshed.session?.user) {
    // Treat as logged in (no cookie rewrite mid-render)
    return refreshed.session.user;
  }

  // 3️⃣ Still nothing → not logged in
  return null;
}

// -------------------------------------------------------------
// requireUser(): Enforce authentication (redirects if missing)
// -------------------------------------------------------------
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
