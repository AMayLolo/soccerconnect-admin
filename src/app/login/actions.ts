"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Missing credentials" };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "admin.soccerconnectusa.com";

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

  // IMPORTANT: Next 16 cookies() is async
  const cookieStore = await cookies();

  // These two cookies are what getCurrentUser() will read
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true,                // required on HTTPS prod
    sameSite: "none",            // allows cross-site in prod if needed
    path: "/",
    domain: DOMAIN,              // <- make sure this matches your prod host
    maxAge: 60 * 60,             // 1 hour
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: DOMAIN,
    maxAge: 60 * 60 * 24 * 7,    // 7 days
  });

  // ✅ FINAL redirect after login
  redirect("/protected");
}

