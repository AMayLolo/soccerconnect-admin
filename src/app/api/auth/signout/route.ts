// src/app/api/auth/signout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const DOMAIN = "admin.soccerconnectusa.com"; // <-- or remove this field below if cookies were set without domain

async function clearAuthCookies() {
  const cookieStore = await cookies();

  // clear access token
  cookieStore.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: DOMAIN, // <-- if this causes issues after deploy, remove this line from BOTH sets
    maxAge: 0,
  });

  // clear refresh token
  cookieStore.set("sb-refresh-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: DOMAIN, // <-- same note
    maxAge: 0,
  });
}

export async function GET() {
  try {
    await clearAuthCookies();

    // redirect user back to /login
    return NextResponse.redirect("/login", { status: 302 });
  } catch (err) {
    console.error("SIGNOUT ERROR (GET):", err);
    return new NextResponse("Signout failed", { status: 500 });
  }
}

// allow POST logout calls too if you ever call fetch(...)
export async function POST() {
  return GET();
}
