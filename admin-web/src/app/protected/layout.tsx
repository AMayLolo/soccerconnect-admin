// admin-web/src/app/protected/layout.tsx
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

// all protected pages are dynamic and never cached
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getUserAndRole() {
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

  // 1. who is logged in?
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. confirm they’re an admin
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/login');
  }

  return {
    email: user.email ?? '',
    role: adminRow.role ?? 'admin',
  };
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, role } = await getUserAndRole();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-green-600" />
            <span className="font-semibold text-gray-900">
              SoccerConnect • Admin
            </span>
            <span className="text-sm text-gray-500">
              ({role}: {email})
            </span>
          </div>

          {/* Sign out form */}
          <form
            method="post"
            action="/auth/signout"
          >
            <button
              type="submit"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Body frame: sidebar + page content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:block w-60 border-r border-gray-200 bg-gray-50/60">
          <nav className="p-4 space-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <Link
                href="/protected"
                className="text-gray-700 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-200 rounded-md px-3 py-2"
              >
                Dashboard
              </Link>

              <Link
                href="/protected/reviews"
                className="text-gray-700 hover:text-blue-600 hover:bg-white border border-transparent hover:border-blue-200 rounded-md px-3 py-2"
              >
                Reviews
              </Link>

              <Link
                href="/protected/reports"
                className="text-gray-400 cursor-not-allowed border border-transparent rounded-md px-3 py-2"
                aria-disabled="true"
              >
                Reports (coming soon)
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
