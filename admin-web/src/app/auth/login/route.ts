// admin-web/src/app/auth/login/route.ts
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

// Handle POST /auth/login
export async function POST(req: NextRequest) {
  // Grab the submitted form fields
  const formData = await req.formData();
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;

  // We'll decide where to send them after auth
  // Start by creating a response that points to /protected
  let res = NextResponse.redirect(new URL('/protected', req.url));

  // Make a Supabase server client that's allowed to set cookies on `res`
  const supabase = getSupabaseServer(req, res);

  // Actually try to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email: email ?? '',
    password: password ?? '',
  });

  if (error) {
    // On failure, send them back to /login with an error message in the URL
    res = NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url)
    );
  }

  return res;
}
