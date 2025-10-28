import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Called from SupabaseSessionListener on auth state changes
 * - Syncs Supabase session tokens into Next.js cookies
 * - Also auto-logs user out and marks session_expired if session is gone
 */
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const { session } = await req.json();

  // If session is missing or invalid: treat this as "session died"
  if (
    !session ||
    !session.access_token ||
    !session.refresh_token
  ) {
    console.warn("[/api/auth] No valid session. Clearing cookies and marking expired.");

    // Kill active auth cookies
    cookieStore.set("sb-access-token", "", {
      maxAge: 0,
      path: "/",
    });
    cookieStore.set("sb-refresh-token", "", {
      maxAge: 0,
      path: "/",
    });

    // Clear any Supabase-managed auth cookie variants
    cookieStore
      .getAll()
      .filter((c) => c.name.includes("sb-") && c.name.includes("auth"))
      .forEach((c) => {
        cookieStore.set(c.name, "", { maxAge: 0, path: "/" });
      });

    // Set session_expired flag so UI can show toast
    cookieStore.set("session_expired", "1", {
      path: "/",
      maxAge: 60, // 1 minute
      httpOnly: false, // client needs to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, expired: true });
  }

  // Otherwise: we DO have a valid session → sync it to cookies using Supabase helper
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // allowed here (route handler context)
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );

  // This tells Supabase to re-issue / refresh its auth cookies in our context
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  return NextResponse.json({ ok: true, expired: false });
}
