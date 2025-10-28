"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Local CookieOptions type (Next.js doesn’t export it)
type CookieOptions = {
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  domain?: string;
};

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo =
    (formData.get("redirectTo") as string | null) || "/protected";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // ✅ Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Try sign-in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    console.error("[loginAction] Login failed:", error?.message);
    return { error: "Invalid email or password." };
  }

  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;
  const isProd = process.env.NODE_ENV === "production";

  // ✅ Cookie base configuration
  const baseCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  const accessCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 60 * 60, // 1 hour
  };

  const refreshCookieOptions: CookieOptions = {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };

  // ✅ Add domain for production
  if (isProd) {
    accessCookieOptions.domain = ".soccerconnectusa.com";
    refreshCookieOptions.domain = ".soccerconnectusa.com";
  }

  // ✅ Set cookies securely
  const cookieStore = await cookies();
  cookieStore.set("sb-access-token", accessToken, accessCookieOptions);
  cookieStore.set("sb-refresh-token", refreshToken, refreshCookieOptions);

  // ✅ Redirect to protected area
  redirect(redirectTo);
}
