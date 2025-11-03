// src/app/api/auth/login/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const cookieStore = await cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase env vars", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data?.session) {
    console.error("❌ Login error:", error?.message || "No session returned");
    return NextResponse.json(
      { error: error?.message || "Login failed" },
      { status: 400 }
    );
  }

  const { access_token, refresh_token, expires_in } = data.session;

  // ✅ ensure both cookies are written
  const res = NextResponse.json({ user: data.user });
  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: expires_in,
  });

  // ✅ force refresh_token to be set manually if Supabase skips it
  if (refresh_token) {
    res.cookies.set("sb-refresh-token", refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } else {
    console.warn("⚠️ Supabase did not return a refresh token!");
  }

  console.log("✅ Cookies set for:", data.user.email);
  return res;
}
