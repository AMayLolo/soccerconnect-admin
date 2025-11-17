import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  if (hostname === "admin.soccerconnectusa.com") {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (hostname === "app.soccerconnectusa.com") {
    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Default domain → marketing
  url.pathname = `/marketing${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
