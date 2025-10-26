// src/utils/auth.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, type User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// server-only supabase client using service role
function getServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// read auth cookies in Next 16
async function readAuthCookies() {
  const cookieStore = await cookies();

  const safeGet = (name: string): string | undefined => {
    try {
      const c = cookieStore.get(name);
      return c?.value;
    } catch {
      return undefined;
    }
  };

  return {
    accessToken: safeGet("sb-access-token"),
    refreshToken: safeGet("sb-refresh-token"),
  };
}

// are they logged in?
export async function getCurrentUser(): Promise<User | null> {
  const { accessToken, refreshToken } = await readAuthCookies();
  if (!accessToken || !refreshToken) return null;

  const supabaseServer = getServiceClient();

  // try access token
  const { data: userRes, error: userErr } =
    await supabaseServer.auth.getUser(accessToken);

  if (!userErr && userRes.user) {
    return userRes.user;
  }

  // try refresh flow
  const { data: refreshed, error: refreshErr } =
    await supabaseServer.auth.refreshSession({
      refresh_token: refreshToken,
    });

  if (refreshErr || !refreshed.session?.user) {
    return null;
  }

  return refreshed.session.user;
}

// redirect to /login if not authed
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirectTo=%2Fprotected");
  }
  return user;
}
