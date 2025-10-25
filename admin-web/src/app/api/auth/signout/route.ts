import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return res.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.signOut();
  return res;
}
