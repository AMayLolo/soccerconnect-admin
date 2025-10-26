import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function getServerSupabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables.");
  }

  // 🟢 Await is required in Next.js 14.2+ / 15
  const cookieStore = await cookies();

  // Create Supabase client that reads tokens from cookies
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers || {});
        const sbAccess = cookieStore.get("sb-access-token")?.value;
        const sbRefresh = cookieStore.get("sb-refresh-token")?.value;

        if (sbAccess) headers.set("Authorization", `Bearer ${sbAccess}`);
        if (sbRefresh) headers.set("x-refresh-token", sbRefresh);

        return fetch(input, { ...init, headers });
      },
    },
  });

  return supabase;
}

export async function getCurrentUser() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("getCurrentUser error:", error.message);
      return null;
    }

    return user ?? null;
  } catch (err: any) {
    console.error("getCurrentUser threw:", err?.message || err);
    return null;
  }
}
// trigger vercel
