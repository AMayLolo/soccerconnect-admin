import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabaseServer';
import SidebarNav from './SidebarNav';
import MobileSidebar from './MobileSidebar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // auth guard
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect('/login?e=not_admin');
  }

  const userEmail = user.email ?? user.id;
  const userRole = adminRow.role ?? '—';

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="min-h-screen flex">

          {/* DESKTOP SIDEBAR */}
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
                <span className="text-gray-700 font-medium break-all">
                  {userEmail}
                </span>
                <br />
                Role:{' '}
                <span className="font-medium text-gray-700">{userRole}</span>
              </p>
            </div>

            <SidebarNav />

            <div className="px-3 py-4 border-t border-gray-200 text-xs text-gray-400">
              © {new Date().getFullYear()} SoccerConnect
            </div>
          </aside>

          {/* MAIN COLUMN */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* TOP BAR */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
              {/* LEFT SIDE OF HEADER */}
              <div className="flex items-center gap-3">
                {/* Mobile hamburger / drawer trigger */}
                <MobileSidebar userEmail={userEmail} role={userRole} />

                {/* Title block */}
                <div className="flex flex-col">
                  <div className="text-sm font-semibold text-gray-900">
                    SoccerConnect • Admin
                  </div>
                  <div className="text-[11px] text-gray-500 leading-tight">
                    Internal moderation dashboard
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE OF HEADER */}
              {/* Desktop-only sign out (mobile uses drawer sign out button) */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right leading-tight">
                  <div className="text-xs font-medium text-gray-900 break-all max-w-[180px]">
                    {userEmail}
                  </div>
                  <div className="text-[11px] text-gray-500">{userRole}</div>
                </div>

                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
