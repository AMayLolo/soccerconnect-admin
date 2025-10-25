import { NextResponse } from "next/server";
import { createServerClientInstance } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const supabase = await createServerClientInstance();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // ✅ Supabase handles setting cookies automatically
    return NextResponse.redirect(new URL("/protected", req.url));
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
