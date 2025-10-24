// admin-web/src/app/protected/layout.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

// pages that show up in the sidebar
const NAV_LINKS = [
  { href: '/protected', label: 'Dashboard' },
  { href: '/protected/reviews', label: 'Reviews' },
  { href: '/protected/flagged', label: 'Flagged' },
  { href: '/protected/reports', label: 'Reports' },
];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Auth check (server-side)
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Get admin row / role
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/login?e=not_admin');
  }

  // small helper for the nav
  const pathname = ''; // we can’t read pathname in an RSC without passing it in
  // We'll solve active state in step 2 with a tiny ClientNav component.
  // For now we'll just render them as plain links.

  // 3. Layout chrome
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="min-h-screen flex">

          {/* Sidebar */}
          <aside className="hidden md:flex md:w-64 flex-col border-r border-gray-200 bg-white">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-600 text-white font-semibold">
                  SC
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 leading-tight">
                    SoccerConnect
                  </span>
                  <span className="text-xs text-gray-500 leading-tight">
                    Admin console
                  </span>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-gray-500 leading-snug">
                Signed in as:
                <br />
                <span className="font-medium text-gray-700 break-all">
                  {user.email ?? user.id}
                </span>
                <br />
                Role:{' '}
                <span className="font-medium text-gray-700">
                  {adminRow.role}
                </span>
              </p>
            </div>

            {/* nav list */}
            <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    block rounded-md px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-3 py-4 border-t border-gray-200 text-xs text-gray-400">
              © {new Date().getFullYear()} SoccerConnect
            </div>
          </aside>

          {/* Main column */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Top header bar */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-gray-900">
                  SoccerConnect • Admin
                </div>
                <div className="text-[11px] text-gray-500 leading-tight">
                  Internal moderation dashboard
                </div>
              </div>

              {/* We'll improve this in step 4 with a dropdown,
                 but for now it’s just Sign out */}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Sign out
                </button>
              </form>
            </header>

            {/* Page content */}
            <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
