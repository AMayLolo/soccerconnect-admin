// admin-web/proxy.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 "proxy" (replaces middleware). Runs on every request matched by `config.matcher`.
 */
export default async function proxy(req: NextRequest) {
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
  const isAuthRoute =
    pathname === '/login' ||
    pathname.startsWith('/auth/');
  const isStaticAsset =
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  // Not logged in -> redirect to /login
  if (!user && !isAuthRoute && !isStaticAsset) {
    const url = new URL('/login', origin);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Logged in and visiting /login -> redirect to /protected
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/protected', origin));
  }

  return res;
}

/**
 * Choose which paths this proxy runs on.
 * This pattern excludes static assets but covers your pages.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
