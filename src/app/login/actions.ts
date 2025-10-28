"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (err) {
            console.error("Error setting cookies:", err);
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[loginAction] Error:", error.message);
    return { error: "Invalid email or password" };
  }

  const session = data.session;
  if (!session) {
    console.error("[loginAction] No session returned after login");
    return { error: "Login failed: no session received" };
  }

  // ✅ Define cookie options
  const isProd = process.env.NODE_ENV === "production";
  const accessCookieOptions: any = {
    maxAge: 60 * 60, // 1 hour
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  const refreshCookieOptions: any = {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  // ✅ Add cross-subdomain cookie domain for production
  if (isProd) {
    const PROD_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || ".soccerconnectusa.com";
    accessCookieOptions.domain = PROD_DOMAIN;
    refreshCookieOptions.domain = PROD_DOMAIN;

    accessCookieOptions.sameSite = "none";
    refreshCookieOptions.sameSite = "none";
    accessCookieOptions.secure = true;
    refreshCookieOptions.secure = true;
  }

  // ✅ Set cookies
  cookieStore.set("sb-access-token", session.access_token, accessCookieOptions);
  cookieStore.set("sb-refresh-token", session.refresh_token, refreshCookieOptions);

  console.log("[loginAction] Login success — redirecting to /protected");
  redirect("/protected");
}
