"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Handles user login form submission.
 * Authenticates against Supabase, then stores tokens in secure cookies.
 */
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
    console.error("[loginAction] Missing Supabase env vars");
    return { error: "Server not configured" };
  }

  // public Supabase client for user auth
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

  if (error || !data.session) {
    console.error("[loginAction] signIn error:", error?.message);
    return { error: "Invalid email or password" };
  }

  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;

  /**
   * Fix for Next.js 16 “Promise<ReadonlyRequestCookies>” type mismatch.
   * cookies() is sync at runtime but typed async in @types/next.
   */
  const cookieStore = (cookies() as unknown) as {
    set(
      name: string,
      value: string,
      options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
        path?: string;
        maxAge?: number;
      }
    ): void;
  };

  // set access + refresh tokens
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // redirect to protected area
  redirect("/protected");
}
