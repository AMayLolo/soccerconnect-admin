import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();

  // Wipe auth cookies (both custom and supabase-managed)
  cookieStore.set("sb-access-token", "", {
    maxAge: 0,
    path: "/",
  });
  cookieStore.set("sb-refresh-token", "", {
    maxAge: 0,
    path: "/",
  });

  // Also clear supabase's default cookie name pattern just in case:
  // (This is defensive — Supabase sometimes stores a cookie like `sb-<project>-auth-token`)
  cookieStore
    .getAll()
    .filter((c) => c.name.includes("sb-") && c.name.includes("auth"))
    .forEach((c) => {
      cookieStore.set(c.name, "", { maxAge: 0, path: "/" });
    });

  // 🔔 Set a short-lived, non-HTTPOnly cookie so the client can read it.
  // This tells the UI to display "Session expired" once.
  cookieStore.set("session_expired", "1", {
    path: "/",
    maxAge: 60, // 1 minute is plenty
    httpOnly: false, // must be readable in the browser
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Redirect back to /login (must be absolute in edge runtimes, but
  // NextResponse.redirect("/login") is allowed in a route handler)
  return NextResponse.redirect("/login");
}
