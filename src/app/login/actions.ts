"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

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

  // normal public client for auth
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

  // pull tokens out of session
  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;

  // set cookies so that getCurrentUser() can read them on the server
  const cookieStore = await cookies();

  // VERY IMPORTANT: secure: true because you're on https in prod
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // optional: maxAge in seconds (e.g. 1 day)
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // refresh can live longer
  });

  // if we get here, you're logged in
  redirect("/protected");
}
