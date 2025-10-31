// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    await supabase.auth.signOut();

    const res = NextResponse.json({ success: true });

    // Explicitly clear all Supabase cookies
    res.cookies.delete("sb-access-token");
    res.cookies.delete("sb-refresh-token");
    res.cookies.delete("sb-fwmakeazbshawabsqeea-auth-token");

    return res;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
