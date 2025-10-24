// admin-web/src/app/protected/layout.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();

  // 1) Require a logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2) Require an admin row (you can relax this if you ever add other roles)
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  if (!adminRow) redirect('/login?e=not_admin');

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-600" />
              <span className="text-lg font-semibold">SoccerConnect • Admin</span>
              <span className="hidden text-xs text-gray-500 md:inline-block">
                (role: {adminRow.role})
              </span>
            </div>

            {/* Sign out */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                title={user.email ?? 'Sign out'}
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="hidden rounded-xl border bg-white p-3 md:block">
            <nav className="space-y-1 text-sm">
              <SidebarLink href="/protected">Dashboard</SidebarLink>
              <SidebarLink href="/protected/reviews">Reviews</SidebarLink>
              <SidebarLink href="/slack">Slack test</SidebarLink>
              {/* Add more links as you add routes */}
            </nav>
          </aside>

          {/* Main content */}
          <main className="min-w-0 rounded-xl border bg-white p-4 md:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

/* ---------- helpers ---------- */

// simple server-safe link (no active highlighting to avoid client code here)
function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2 hover:bg-gray-50"
      prefetch={false}
    >
      {children}
    </Link>
  );
}
