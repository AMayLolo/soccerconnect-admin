// src/app/api/auth/signout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();

  // Blow away the auth cookies
  cookieStore.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  cookieStore.set("sb-refresh-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  // Send a real browser redirect to /login
  return NextResponse.redirect("/login", { status: 302 });
}

// (optional, in case something calls it with POST)
export async function POST() {
  return GET();
}
