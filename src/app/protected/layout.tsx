// src/app/protected/layout.tsx
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { getCurrentUser } from "@/utils/auth";

export const metadata = {
  title: "SoccerConnect — Protected",
  description: "Protected admin area — SoccerConnect",
};

/**
 * Protected layout that wraps all /protected routes.
 * - If user is not authenticated, redirect to /login
 * - If authenticated, render children (server component)
 *
 * Note: this is a server component (async) because it awaits getCurrentUser().
 */
export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // getCurrentUser uses server-side Supabase helper
  const user = await getCurrentUser();

  if (!user) {
    // send user to login page; app router redirect is server-side
    redirect("/login");
  }

  // If logged in, render the protected layout (nav + children)
  return (
    <>
      {/* Thin protected admin layout — adjust markup/styles to taste */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="w-full border-b bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/protected">
                <span className="text-xl font-semibold">SoccerConnect Admin</span>
              </Link>
              <nav className="hidden md:flex gap-3 ml-4">
                <Link href="/protected/flagged" className="text-sm">Flagged</Link>
                <Link href="/protected/reports" className="text-sm">Reports</Link>
                <Link href="/protected/settings" className="text-sm">Settings</Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">Signed in as <strong>{user.email ?? user?.user_metadata?.email ?? user.id}</strong></span>

              {/* Sign out: adjust route if different in your app */}
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md border text-sm hover:bg-gray-100"
                  title="Sign out"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="max-w-[1200px] mx-auto px-4 py-6">
          {/* page content */}
          {children}
        </main>

        <Toaster />
      </div>
    </>
  );
}
