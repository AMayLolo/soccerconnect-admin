"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    console.error("[loginAction] Missing credentials");
    return { error: "Missing credentials" };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[loginAction] Missing Supabase env vars");
    return { error: "Server not configured" };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
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

  // ✅ FIX: await cookies() for Next.js 16
  const cookieStore = await cookies();

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

  console.log("[loginAction] Login successful, redirecting...");
  redirect("/protected");
}
