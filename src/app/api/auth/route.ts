import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const { session } = await req.json();

  // ✅ Guard against null or invalid session
  if (!session) {
    // This happens on signOut or expired session
    console.warn("[/api/auth] No session provided — clearing cookies");

    cookieStore.set("sb-access-token", "", { maxAge: 0, path: "/" });
    cookieStore.set("sb-refresh-token", "", { maxAge: 0, path: "/" });

    return NextResponse.json({ ok: true, cleared: true });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // ✅ Safely set session (avoids null errors)
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[/api/auth] Failed to set session:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
