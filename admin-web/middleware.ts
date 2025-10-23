// admin-web/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname, origin } = req.nextUrl;

  // If NOT logged in and not already on /login -> send to /login
  if (!user && pathname !== '/login') {
    const url = new URL('/login', origin);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and trying to view /login -> send to /protected
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/protected', origin));
  }

  return res;
}

export const config = {
  matcher: ['/', '/protected/:path*', '/login'],
};
