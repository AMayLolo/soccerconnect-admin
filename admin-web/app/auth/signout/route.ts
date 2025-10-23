// admin-web/app/auth/signout/route.ts
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL('/login', url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Note: for Route Handlers, read incoming cookies from the request
          // but mutations must be applied to the response
          return (response.cookies.get(name)?.value ??
                  // fallback to request cookies
                  (('headers' in request &&
                    // @ts-ignore: Request in Next has headers.get
                    (request as any).headers?.get('cookie') || '')
                    .split('; ')
                    .find((c: string) => c.startsWith(name + '='))
                    ?.split('=')[1]));
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
