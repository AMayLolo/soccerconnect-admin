"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Returns the authenticated user + linked profile record.
 * Uses Supabase Service Role for server-side access.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies(); // ✅ Now async in Next.js 16

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, club_id")
    .eq("id", user.id)
    .single();

  if (profileError) console.warn("Profile fetch error:", profileError.message);

  return { ...user, profile };
}

