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

  // Public supabase client just for sign-in
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

  // write cookies
  const cookieStore = cookies();

  // in prod we need secure cookies, in dev (http://localhost) we can't use secure:true
  const isProd = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://");

  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // success -> go to dashboard
  redirect("/protected");
}
