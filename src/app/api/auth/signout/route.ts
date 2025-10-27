// src/app/api/auth/signout/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE_URL = "https://admin.soccerconnectusa.com";

export async function GET() {
  // just bounce to login with an absolute URL
  return NextResponse.redirect(`${BASE_URL}/login`, { status: 302 });
}

export async function POST() {
  return GET();
}
