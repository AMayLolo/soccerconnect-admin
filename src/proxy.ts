import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log(
    "[PROXY]",
    "path=", req.nextUrl.pathname,
    "user=", user?.email,
    "error=", error?.message
  );

  // 🔴 DO NOT redirect. Always just continue.
  return res;
}

export const config = {
  matcher: ["/login", "/protected/:path*"],
};
