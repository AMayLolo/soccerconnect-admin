// admin-web/src/app/login/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// helper to read current session — if already signed in, skip login page
async function getSessionUser() {
  const cookieStore = await cookies();
  // temporary response stub just so createServerClient is happy
  const fakeRes = {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  } as any;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // if you're already logged in, don't show login again
  const user = await getSessionUser();
  if (user) {
    redirect('/protected');
  }

  const errorMsg = searchParams?.error ?? null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Suspense fallback={<div className="text-gray-500">Loading…</div>}>
        <div className="w-full max-w-sm bg-white rounded-lg shadow p-6 border border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            SoccerConnect Admin
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Sign in with your admin credentials.
          </p>

          {errorMsg && (
            <div className="mb-4 rounded bg-red-50 text-red-700 text-sm p-2 border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* This is the magic:
             We POST directly to /auth/login, which sets cookies and redirects.
          */}
          <form
            method="POST"
            action="/auth/login"
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </Suspense>
    </main>
  );
}
