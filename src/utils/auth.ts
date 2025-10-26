// src/utils/auth.ts
//
// SERVER-ONLY AUTH HELPERS
//
// - Reads sb-access-token / sb-refresh-token from cookies (Next 16 style)
// - Uses service role key ONLY on the server to validate the user
// - Gives you getCurrentUser() for "am I logged in?"
// - Gives you requireUser() for protected routes
//
// IMPORTANT: don't import this from Client Components.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type User } from "@supabase/supabase-js";

// ----- ENV VARS (typed + runtime check) -----
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "[auth.ts] Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

// Create a *server-only* supabase client that can validate tokens.
// NOTE: SERVICE_ROLE_KEY never goes to browser.
function getServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Helper to read the auth cookies from Next 16's async cookies()
async function readAuthCookies() {
  // cookies() is async in Next 16, so we MUST await it
  const cookieStore = await cookies();

  // In prod we'll have two cookies we set at login
  //   sb-access-token
  //   sb-refresh-token
  //
  // BUT on localhost, Next dev tools will sometimes try to
  // read+JSON.parse preview cookies (like "base64-..."),
  // which can explode. We'll defensively guard against that.

  const getCookie = (name: string): string | undefined => {
    try {
      const c = cookieStore.get(name);
      // c is { name, value, ... } or undefined
      if (!c) return undefined;
      return c.value;
    } catch (err) {
      console.warn(
        `[auth.ts] failed to read cookie "${name}":`,
        (err as Error).message
      );
      return undefined;
    }
  };

  const accessToken = getCookie("sb-access-token");
  const refreshToken = getCookie("sb-refresh-token");

  return { accessToken, refreshToken };
}

// Public helper: are they logged in? (does NOT redirect)
// ----------------------------------------------------------------
export async function getCurrentUser(): Promise<{
  user: User | null;
  redirectToLogin: boolean;
}> {
  const { accessToken, refreshToken } = await readAuthCookies();

  if (!accessToken || !refreshToken) {
    // no session cookies at all
    return {
      user: null,
      redirectToLogin: true,
    };
  }

  const supabaseServer = getServiceClient();

  // 1. Try to verify the access token against Supabase
  const { data: userResult, error: userErr } =
    await supabaseServer.auth.getUser(accessToken);

  if (userErr || !userResult.user) {
    // Access token might be expired, try refresh flow
    const { data: refreshed, error: refreshErr } =
      await supabaseServer.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (refreshErr || !refreshed.session?.user) {
      // refresh also failed -> no valid session
      return {
        user: null,
        redirectToLogin: true,
      };
    }

    // refresh succeeded -> the refreshed.session has new tokens,
    // BUT: we do NOT silently rewrite cookies here.
    // Why? We're in a helper that might be called during render,
    // and setCookie() in the middle of a render causes weirdness.
    //
    // Instead we just treat them as logged in for now.
    return {
      user: refreshed.session.user,
      redirectToLogin: false,
    };
  }

  // access token was valid
  return {
    user: userResult.user,
    redirectToLogin: false,
  };
}

// Strict helper for protected routes/pages
// Call this at the top of /protected/... pages.
// If not logged in, it will redirect("/login") on the server.
// ----------------------------------------------------------------
export async function requireUser(): Promise<User> {
  const { user, redirectToLogin } = await getCurrentUser();

  if (redirectToLogin || !user) {
    redirect("/login");
  }

  return user;
}
