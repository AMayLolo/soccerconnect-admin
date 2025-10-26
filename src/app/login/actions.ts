"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    console.error("[loginAction] missing email or password");
    return { error: "Missing credentials" };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[loginAction] Missing Supabase env vars in production");
    return { error: "Server not configured" };
  }

  // public client for sign-in
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[loginAction] signIn error:", error.message);
    return { error: "Invalid email or password" };
  }

  if (!data.session) {
    console.error("[loginAction] no session returned");
    return { error: "Login failed" };
  }

  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;

  const cookieStore = await cookies();

  // We'll overwrite these cookies every login, always.
  //
  // KEY CHANGE:
  // - sameSite: "none" and secure: true works in modern browsers under HTTPS custom domains.
  //   ("lax" sometimes doesn't get sent on the cross-navigation redirect -> /protected,
  //    which makes the protected page think you're logged out.)
  //
  // - path: "/" so everything (including /protected) can see them.
  //
  // - httpOnly: true so JS can't touch them (good).
  //
  // NOTE: If you're testing locally on http://localhost this "secure: true"
  //       means the cookie won't actually stick; that's okay for prod deploy
  //       debugging. We can branch later if we need localhost as well.
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // redirect target (if login page had ?redirectTo=...)
  // BUT -> if that redirect target is /protected, that page will re-check
  // auth. That's fine IF cookies stuck. If cookies didn't stick, we would
  // spin; but we just changed cookie policy to fix that.
  //
  // We'll still default to /protected.
  const redirectTo =
    (formData.get("redirectTo") as string | null) ?? "/protected";

  redirect(redirectTo);
}
