import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  // ✅ Clear Supabase cookies
  cookieStore.set("sb-access-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("sb-refresh-token", "", { maxAge: 0, path: "/" });

  // ✅ Build absolute redirect URL (Next.js 16 requirement)
  const origin = new URL(request.url).origin;
  const res = NextResponse.redirect(`${origin}/login`);

  // Also clear them again in response for safety
  res.cookies.set("sb-access-token", "", { maxAge: 0, path: "/" });
  res.cookies.set("sb-refresh-token", "", { maxAge: 0, path: "/" });

  return res;
}
