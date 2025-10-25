// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // ✅ Fetch user from Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Redirect logic
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedPage = req.nextUrl.pathname.startsWith("/protected");

  if (!user && isProtectedPage) {
    console.log("Middleware: not logged in → redirecting to /login");
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    console.log("Middleware: logged in → redirecting to /protected");
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/protected";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/protected/:path*", "/login"],
};
