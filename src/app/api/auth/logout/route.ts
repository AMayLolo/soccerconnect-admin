import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  // Next.js requires absolute URLs for Response.redirect in route handlers
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "https://www.soccerconnectusa.com";
  const url = typeof base === "string" && base.startsWith("http") ? base : `https://${base}`;
  return NextResponse.redirect(new URL("/auth/login", url));
}
