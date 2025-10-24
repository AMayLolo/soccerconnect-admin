// admin-web/src/app/login/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

async function getSessionAndRole() {
  // read incoming request cookies
  const cookieStore = await cookies();

  // we create a faux response so createServerClient doesn't explode
  const fakeRes = {
    cookies: {
      get() {},
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

  // get authed user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false, role: null };
  }

  // check if they're in admin_users
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = !!adminRow;
  const role = adminRow?.role ?? null;

  return { user, isAdmin, role };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const { user, isAdmin, role } = await getSessionAndRole();

  // If you're logged in AND you are an admin, don't even show login.
  if (user && isAdmin) {
    redirect('/protected');
  }

  const loginError = searchParams?.error ?? null;
  const notAdmin = user && !isAdmin;

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

          {/* Case: logged in but NOT an admin */}
          {notAdmin && (
            <div className="mb-4 rounded bg-yellow-50 text-yellow-800 text-sm p-2 border border-yellow-200">
              You’re signed in as <strong>{user?.email}</strong>, but you’re not
              authorized as an admin for this dashboard.
            </div>
          )}

          {/* Case: bad password, etc */}
          {loginError && (
            <div className="mb-4 rounded bg-red-50 text-red-700 text-sm p-2 border border-red-200">
              {loginError}
            </div>
          )}

          {/* If you're not admin, we still show the form so you can try a different account */}
          <form method="POST" action="/auth/login" className="space-y-4">
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
