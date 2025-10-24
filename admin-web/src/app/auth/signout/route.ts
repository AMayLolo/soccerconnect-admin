// admin-web/src/app/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function getSupabaseServer(req: NextRequest, res: NextResponse) {
  return createServerClient(
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
}

// We’ll support GET so that a plain <a href="/auth/signout"> works.
export async function GET(req: NextRequest) {
  // Start building a redirect response right away
  const res = NextResponse.redirect(new URL('/login', req.url));

  // attach supabase to this response so it can mutate cookies
  const supabase = getSupabaseServer(req, res);

  // Sign out (this clears the auth cookies in `res`)
  await supabase.auth.signOut();

  // Send them to /login with cleared session
  return res;
}

// Also allow POST just in case we later switch to a <form method="POST">
export async function POST(req: NextRequest) {
  return GET(req);
}
