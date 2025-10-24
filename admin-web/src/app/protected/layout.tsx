// admin-web/src/app/protected/layout.tsx
import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* simple top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-900">
          <div className="h-4 w-4 rounded-full bg-green-600" />
          <span>SoccerConnect • Admin</span>
        </div>

        <form action="/auth/signout" method="post">
          <button
            className="rounded bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-300 hover:bg-gray-200"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* page body */}
      <main className="px-6 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
