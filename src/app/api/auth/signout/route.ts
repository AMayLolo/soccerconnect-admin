import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  await supabase.auth.signOut();

  // Clear Supabase cookies
  const res = NextResponse.json({ success: true });
  res.cookies.delete("sb-access-token");
  res.cookies.delete("sb-refresh-token");

  return res;
}
