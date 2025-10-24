import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // server-side auth check
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in, bounce to /login
    return (
      <html lang="en">
        <body className="p-6 text-sm text-gray-700">
          <p>Not signed in. <a className="text-blue-600 underline" href="/login">Go to login →</a></p>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="min-h-screen flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="text-lg font-bold text-gray-900">
                SoccerConnect Admin
              </div>
              <div className="text-[11px] text-gray-500">
                {user.email}
              </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
              <Link
                href="/protected"
                className="block rounded px-3 py-2 font-medium text-gray-800 hover:bg-gray-100"
              >
                Dashboard
              </Link>

              <Link
                href="/protected/reviews"
                className="block rounded px-3 py-2 font-medium text-gray-800 hover:bg-gray-100"
              >
                Reviews
              </Link>

              <Link
                href="/protected/flagged"
                className="block rounded px-3 py-2 font-medium text-red-700 hover:bg-red-50"
              >
                Flagged
              </Link>

              <Link
                href="/protected/reports"
                className="block rounded px-3 py-2 font-medium text-gray-800 hover:bg-gray-100"
              >
                Reports
              </Link>
            </nav>

            <div className="px-4 py-4 border-t border-gray-200 text-sm">
              <form action="/auth/signout" method="post">
                <button
                  className="w-full rounded border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 hover:bg-gray-100"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
