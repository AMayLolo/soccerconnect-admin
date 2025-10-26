"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// We use the public anon key here because this runs as the "user"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "[login/actions.ts] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Helper: build a Supabase client that acts like the browser client,
// but we're on the server so we can do it in a Server Action.
function getPublicClient() {
  return createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// This is called by the LoginClient form submit
export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    console.error("[loginAction] Missing email or password");
    return { error: "Missing email or password." };
  }

  const supabase = getPublicClient();

  // Step 1: sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[loginAction] signInWithPassword error:", error.message);
    return { error: "Invalid email or password." };
  }

  if (!data.session) {
    console.error("[loginAction] No session returned from Supabase");
    return { error: "Login failed. No session." };
  }

  // pull tokens out of session
  const accessToken = data.session.access_token;
  const refreshToken = data.session.refresh_token;

  if (!accessToken || !refreshToken) {
    console.error("[loginAction] Supabase session missing tokens");
    return { error: "Login failed (no tokens)." };
  }

  // Step 2: write the tokens into HTTP-only cookies so
  // getCurrentUser() / requireUser() can read them later
  //
  // Next 16: cookies() must be awaited.
  const cookieStore = await cookies();

  // keep these aligned with utils/auth.ts's readAuthCookies()
  cookieStore.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true, // must be true in prod HTTPS, fine in local dev too
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 1, // 1 hour for access token
  });

  cookieStore.set("sb-refresh-token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // Step 3: go to the dashboard
  redirect("/protected");
}
