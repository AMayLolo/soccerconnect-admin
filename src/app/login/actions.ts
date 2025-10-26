"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// -----------------------------------------------------------------------------
// LOGIN ACTION
// -----------------------------------------------------------------------------
export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Create Supabase client using public anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Attempt sign-in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    console.error("Login error:", error?.message);
    return { error: "Invalid email or password" };
  }

  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;

  // ---------------------------------------------------------------------------
  // Determine domain based on environment
  // ---------------------------------------------------------------------------
  const isLocal = process.env.NODE_ENV !== "production";
  const DOMAIN = isLocal ? "localhost" : ".soccerconnectusa.com";

  // IMPORTANT: Next 16 cookies() is async
  const cookieStore = await cookies();

  // ---------------------------------------------------------------------------
  // Access & refresh tokens (server cookies)
  // ---------------------------------------------------------------------------
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: !isLocal, // secure only on prod
    sameSite: isLocal ? "lax" : "none",
    path: "/",
    domain: DOMAIN,
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? "lax" : "none",
    path: "/",
    domain: DOMAIN,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // ---------------------------------------------------------------------------
  // Redirect to dashboard
  // ---------------------------------------------------------------------------
  redirect("/protected");
}
