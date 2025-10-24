// admin-web/src/app/protected/layout.tsx
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// helper to make a server-side supabase client
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getServerClient();

  // get auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // not logged in? go to /login
  if (!user) {
    redirect('/login');
  }

  // check admin_users table for role
  const { data: adminRow, error } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  // not in admin_users or missing row? kick out
  if (error || !adminRow) {
    redirect('/login');
  }

  // optional: enforce only "admin" role:
  if (adminRow.role !== 'admin') {
    redirect('/login');
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Outer shell */}
        <div className="min-h-screen flex flex-col border-t border-gray-200">
          {/* Top header bar */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-green-600" />
                <span className="font-semibold text-gray-900">
                  SoccerConnect • Admin
                </span>
              </div>
              <span className="text-xs text-gray-500">
                (role: {adminRow.role})
              </span>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm font-medium text-white bg-gray-800 rounded-md px-3 py-1.5 hover:bg-gray-900"
              >
                Sign out
              </button>
            </form>
          </header>

          {/* Main content area: sidebar + page content */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <aside className="w-[220px] shrink-0 border-r border-gray-200 bg-white p-4">
              <nav className="flex flex-col gap-4 text-sm text-gray-800">
                <Link
                  href="/protected"
                  className="hover:underline text-gray-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/protected/reviews"
                  className="hover:underline text-gray-900"
                >
                  Reviews
                </Link>

                <Link
                  href="/protected/reports"
                  className="hover:underline text-gray-900"
                >
                  Reports
                </Link>
              </nav>
            </aside>

            {/* Page content */}
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
