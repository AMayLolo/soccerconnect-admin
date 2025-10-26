// admin-web/src/utils/supabase/auth.ts

import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

/**
 * Env vars
 * NOTE:
 *  - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *    must be defined in Vercel (we already added those).
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * We throw early if you're missing config. This helps catch problems
 * during build, not at runtime inside a route.
 */
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "[auth.ts] Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
}

/**
 * getCurrentUser()
 *
 * - Reads the `sb-access-token` cookie that we set during loginAction.
 * - Uses the service role key to validate that token with Supabase.
 * - Returns the Supabase user object or null if not logged in.
 *
 * This MUST run on the server (it's using next/headers and service role).
 */
export async function getCurrentUser(): Promise<User | null> {
  // cookies() in Next App Router is synchronous, no await
  const cookieStore = cookies();

  // we wrote these in loginAction
  const accessToken = cookieStore.get("sb-access-token")?.value;

  if (!accessToken) {
    // user is not signed in (or cookie expired)
    return null;
  }

  // admin client using service role. We disable session persistence because
  // we're manually passing the accessToken.
  const adminClient = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  });

  // validate that token with Supabase and get user info
  const {
    data: { user },
    error,
  } = await adminClient.auth.getUser(accessToken);

  if (error) {
    console.error("[getCurrentUser] error:", error.message);
    return null;
  }

  return user ?? null;
}

/**
 * requireUser()
 *
 * - Call this at the top of any server component/page
 *   that should be protected.
 * - If there's no valid user, we redirect to /login.
 * - Otherwise we return the user so the page can use it.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    // 307 to /login (Next.js redirect throws to trigger navigation)
    redirect("/login");
  }
  return user;
}
