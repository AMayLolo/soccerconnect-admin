// src/app/login/actions.ts
"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server Action: loginAction
 *
 * Called from <LoginClient /> with email/password (+ redirectTo).
 * - Validates credentials with Supabase
 * - On success: sets httpOnly cookies for access/refresh tokens
 * - Redirects to redirectTo (or /protected)
 * - On failure: returns { error: "..." } and DOES NOT redirect
 */
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // where to send them after login
  const redirectTo =
    (formData.get("redirectTo") as string | null) || "/protected";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Create a Supabase client (server-side) using anon key.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Attempt sign-in
  const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInResult.error || !signInResult.data.session) {
    console.error(
      "[loginAction] Login error:",
      signInResult.error?.message
    );
    return { error: "Invalid email or password." };
  }

  // Pull tokens from Supabase session
  const accessToken = signInResult.data.session.access_token;
  const refreshToken = signInResult.data.session.refresh_token;

  // Get cookie jar from Next.js server
  const cookieStore = await cookies();

  const isProd = process.env.NODE_ENV === "production";

  // Base cookie options
  const baseCookieOptions = {
    httpOnly: true,
    secure: isProd, // must be true on HTTPS prod
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
  };

  // access token cookie (shorter life)
  const accessCookieOptions: any = {
    ...baseCookieOptions,
    maxAge: 60 * 60, // 1 hour
  };

  // refresh token cookie (longer life)
  const refreshCookieOptions: any = {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

    // Add domain ONLY in production
  if (isProd) {
    accessCookieOptions.domain = ".soccerconnectusa.com";
    refreshCookieOptions.domain = ".soccerconnectusa.com";
  }

  // Set cookies so server components can read them
  cookieStore.set("sb-access-token", accessToken, accessCookieOptions);
  cookieStore.set("sb-refresh-token", refreshToken, refreshCookieOptions);

  // Hard redirect server-side to the intended page
  redirect(redirectTo);
}
