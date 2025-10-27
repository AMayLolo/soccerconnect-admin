// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force Node runtime + dynamic so we can set cookies and read env
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE_URL = "https://admin.soccerconnectusa.com";

export async function POST(req: Request) {
  try {
    // STEP 1: read form data
    let form: FormData;
    try {
      form = await req.formData();
    } catch (err) {
      console.error("LOGIN STEP 1 formData() error:", err);
      return new NextResponse("Unable to read formData()", { status: 500 });
    }

    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      console.error("LOGIN STEP 1 missing creds", {
        emailPresent: !!email,
        passwordPresent: !!password,
      });
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // STEP 2: build supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("LOGIN STEP 2 missing env", {
        hasUrl: !!supabaseUrl,
        hasAnon: !!supabaseAnonKey,
      });
      return new NextResponse("Supabase env not configured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // STEP 3: sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session) {
      console.error("LOGIN STEP 3 invalid creds", {
        supabaseError: error?.message,
      });
      return new NextResponse("Invalid email or password", { status: 401 });
    }

    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    // STEP 4: build redirect response and attach cookies
    try {
      const res = NextResponse.redirect(
        `${BASE_URL}/protected`,
        { status: 302 }
      );

      res.cookies.set("sb-access-token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });

      res.cookies.set("sb-refresh-token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return res;
    } catch (err) {
      console.error("LOGIN STEP 4 cookie/redirect error:", err);
      return new NextResponse("Failed to set cookies", { status: 500 });
    }
  } catch (err) {
    console.error("LOGIN ROUTE UNCAUGHT:", err);
    return new NextResponse("Server error during login", { status: 500 });
  }
}
