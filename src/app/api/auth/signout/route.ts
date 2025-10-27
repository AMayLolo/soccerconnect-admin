// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Just bounce to /login. No cookie manipulation here at all.
  return NextResponse.redirect("/login", { status: 302 });
}

export async function POST() {
  return GET();
}
