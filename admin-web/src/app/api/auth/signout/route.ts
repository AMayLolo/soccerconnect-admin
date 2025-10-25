import { NextResponse } from "next/server";
import { createServerClientInstance } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createServerClientInstance();

    // ✅ Clears Supabase auth cookies
    await supabase.auth.signOut();

    // ✅ Redirect to login page cleanly
    const res = NextResponse.redirect(new URL("/login", req.url));

    // Just in case, remove any cached cookies
    res.cookies.delete("sb-access-token");
    res.cookies.delete("sb-refresh-token");

    return res;
  } catch (err: any) {
    console.error("Signout error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
