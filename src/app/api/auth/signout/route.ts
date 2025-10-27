// src/app/api/auth/signout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function clearAuthCookies() {
  const cookieStore = await cookies();

  // clear access token
  cookieStore.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",   // fallback from "none"
    path: "/",
    maxAge: 0,
  });

  // clear refresh token
  cookieStore.set("sb-refresh-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function GET() {
  try {
    await clearAuthCookies();

    return NextResponse.redirect("/login", { status: 302 });
  } catch (err) {
    console.error("SIGNOUT ERROR (GET):", err);
    return new NextResponse("Signout failed", { status: 500 });
  }
}

export async function POST() {
  return GET();
}
