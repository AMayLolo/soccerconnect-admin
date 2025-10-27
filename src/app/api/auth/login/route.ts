// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // --- Step 1: pull creds from form
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
      console.error("LOGIN STEP 1 missing creds", { emailPresent: !!email, passwordPresent: !!password });
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // --- Step 2: build supabase client
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

    // --- Step 3: sign in
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

    // --- Step 4: set cookies
    try {
      const cookieStore = await cookies();

      cookieStore.set("sb-access-token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      });

      cookieStore.set("sb-refresh-token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    } catch (err) {
      console.error("LOGIN STEP 4 cookie error:", err);
      return new NextResponse("Failed to set cookies", { status: 500 });
    }

    // --- Step 5: redirect to /protected
    return NextResponse.redirect("/protected", { status: 302 });
  } catch (err) {
    console.error("LOGIN ROUTE UNCAUGHT:", err);
    return new NextResponse("Server error during login", { status: 500 });
  }
}
