// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";

function buildSignoutResponse() {
  // 302 redirect to /login
  const res = NextResponse.redirect("/login", { status: 302 });

  // Clear access token cookie
  res.cookies.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  // Clear refresh token cookie
  res.cookies.set("sb-refresh-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

export async function GET() {
  try {
    return buildSignoutResponse();
  } catch (err) {
    console.error("SIGNOUT ERROR (GET):", err);
    return new NextResponse("Signout failed", { status: 500 });
  }
}

export async function POST() {
  try {
    return buildSignoutResponse();
  } catch (err) {
    console.error("SIGNOUT ERROR (POST):", err);
    return new NextResponse("Signout failed", { status: 500 });
  }
}
