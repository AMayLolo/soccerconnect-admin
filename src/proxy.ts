import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Global auth-aware middleware.
 *
 * - Allows public routes (/, /login, /_next/*, /favicon.ico) without checking Supabase.
 * - For protected routes (/protected/*), ensures we have a user session.
 * - If not logged in, redirects to /login.
 */

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // 1. Allow public stuff with zero Supabase work.
  const isPublic =
    url === "/" ||
    url.startsWith("/login") ||
    url.startsWith("/_next") ||
    url === "/favicon.ico";

  if (isPublic) {
    return NextResponse.next();
  }

  // 2. Only now do we try to hit Supabase
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Protected namespaces start with /protected
  const isProtected = url.startsWith("/protected");

  if (isProtected && !user) {
    // bounce to login (but remember where they were going)
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. otherwise allow through
  return res;
}
