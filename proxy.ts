// /proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
  const host = req.headers.get("host") || "";

  // --- Domain model assumptions ---
  // admin.<rootDomain>   → Admin application (protected interface)
  // <rootDomain> / www.<rootDomain> → Public marketing surface
  // We derive root domain by stripping leading admin./www. if present.
  const isLocalhost = host.startsWith("localhost");
  const rootDomain = host.replace(/^admin\./, "").replace(/^www\./, "");
  const adminHost = `admin.${rootDomain}`;
  // Treat localhost as an "admin" host to simplify local dev (no subdomain needed)
  const isAdminHost = isLocalhost || host.startsWith("admin.");

  // 1. Canonicalize login to admin subdomain so auth cookies remain scoped.
  if (pathname.startsWith("/login") && !isAdminHost && host && !isLocalhost) {
    const redirectUrl = new URL(req.url);
    redirectUrl.hostname = adminHost;
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If requesting a protected path from a non-admin host, redirect to admin host.
  const isProtectedByPath = pathname.startsWith("/protected");
  if (isProtectedByPath && !isAdminHost && host && !isLocalhost) {
    const target = new URL(req.url);
    target.hostname = adminHost;
    return NextResponse.redirect(target);
  }

  // 3. Public *asset* and marketing paths that never need user context when NOT on admin host.
  const isAlwaysPublicPath =
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (isAlwaysPublicPath && !isAdminHost) {
    // No auth check required on public domain – let it stream.
    return NextResponse.next();
  }

  // 4. Create response and bind Supabase SSR client for any remaining cases
  //    (admin host OR non-public path requiring potential auth).
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 5. Enforce auth for protected paths (already normalized to admin host).
  if (isProtectedByPath && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.hostname = adminHost; // ensure redirect lands on admin
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Convenience: If user hits admin root and is logged in, send them to dashboard.
  if (isAdminHost && pathname === "/" && user) {
    const dashUrl = new URL("/protected", req.url);
    return NextResponse.redirect(dashUrl);
  }

  // 7. Otherwise pass through.
  return res;
}

/**
 * Only run this proxy for relevant routes.
 * This prevents it from running on every asset request.
 */
export const config = {
  matcher: ["/protected/:path*", "/login", "/"],
};
