// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Read credentials from the login form POST
    const form = await req.formData();
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // 2. Create a fresh Supabase client (no session yet)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    // 3. Ask Supabase to sign in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session) {
      console.error(
        "supabase signInWithPassword error:",
        error?.message || "no session"
      );
      return new NextResponse("Invalid email or password", { status: 401 });
    }

    // 4. Grab tokens from the new session
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;

    // 5. Write httpOnly auth cookies so the rest of the app can read them
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

    // 6. Redirect to /protected after successful login
    return NextResponse.redirect("/protected", { status: 302 });
  } catch (err) {
    console.error("LOGIN ROUTE CRASH:", err);
    return new NextResponse("Server error during login", { status: 500 });
  }
}
