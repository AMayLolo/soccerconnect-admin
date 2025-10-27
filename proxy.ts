// /proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

/**
 * Global auth-aware proxy (Next.js 16+ replaces middleware.ts).
 *
 * - Public routes (/, /login, /_next/*, /favicon.ico) are allowed without forcing auth.
 * - /protected/* requires a valid Supabase user session.
 * - If not logged in, redirect to /login?redirectTo=<originalPath>
 *
 * This runs BEFORE your page/layout code and helps prevent flashes of protected content.
 */

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Public routes: let them through immediately, no Supabase hit needed.
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (isPublic) {
    return NextResponse.next();
  }

  // 2. Create a response and bind Supabase middleware client to req/res.
  //    This lets Supabase read/refresh auth cookies.
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Protected routes need auth.
  const isProtected = pathname.startsWith("/protected");

  if (isProtected && !user) {
    // Not logged in → send to /login and remember where they wanted to go
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Auth is fine (or route isn't protected) → continue.
  return res;
}

/**
 * Only run this proxy for relevant routes.
 * This prevents it from running on every asset request.
 */
export const config = {
  matcher: ["/protected/:path*", "/login", "/"],
};
