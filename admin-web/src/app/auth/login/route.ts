import { createServerClientInstance } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const supabase = await createServerClientInstance();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // ✅ On success, redirect to protected area
    return NextResponse.redirect(new URL("/protected", req.url));
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
