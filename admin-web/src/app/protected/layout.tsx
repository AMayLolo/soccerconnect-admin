// src/app/protected/layout.tsx
import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Internal moderation console for SoccerConnect",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  console.log("[PROTECTED LAYOUT] user=", user?.email);

  const role = (user?.user_metadata as any)?.role || "user";

  // ⛔ If no user OR wrong role, DO NOT REDIRECT.
  //    Just render an access denied message so we can see it in prod.
  if (!user || role !== "admin") {
    return (
      <html lang="en">
        <body className="bg-gray-50 text-gray-900 min-h-screen flex items-center justify-center">
          <div className="max-w-sm w-full border border-red-300 bg-red-50 text-red-800 rounded-lg p-6 text-center space-y-4 shadow">
            <div className="text-lg font-semibold">Access denied</div>
            <div className="text-sm leading-relaxed">
              {user
                ? `You are signed in as ${user.email ?? "unknown"}, role "${role}", but you are not allowed to view this page.`
                : "You are not signed in or we couldn't read your session."}
            </div>
            <div className="text-xs text-red-700">
              (No redirect. This is a debug screen.)
            </div>

            <Link
              href="/login"
              className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition rounded px-3 py-2"
            >
              Go to login
            </Link>
          </div>

          <Toaster position="bottom-right" />
        </body>
      </html>
    );
  }

  // ✅ If we DO have a valid admin user, render the real app layout
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <header className="border-b bg-white shadow-sm sticky top-0 z-20">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <Link
              href="/protected"
              className="text-lg font-semibold text-blue-700 hover:text-blue-900"
            >
              SoccerConnect • Admin
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link
                href="/protected"
                className="hover:text-blue-600 transition"
              >
                Dashboard
              </Link>

              <Link
                href="/protected/flagged"
                className="hover:text-blue-600 transition"
              >
                Flagged
              </Link>

              <Link
                href="/protected/reports"
                className="hover:text-blue-600 transition"
              >
                Reports
              </Link>

              <span className="text-gray-500 text-xs">
                {user.email ?? "Signed in"}
              </span>

              <Link
                href="/api/auth/signout"
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
