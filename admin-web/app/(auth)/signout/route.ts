import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: Request) {
  // Mirror the request/response cookies for server-side sign-out
  const response = NextResponse.redirect(new URL('/login', request.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-ignore - headers.getSetCookie is fine for runtime
          return request.headers.get('cookie')?.match(new RegExp(`${name}=([^;]+)`))?.[1] ?? undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.signOut();
  return response;
}
