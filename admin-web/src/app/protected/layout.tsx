import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

// This metadata is fine
export const metadata = {
  title: "SoccerConnect Admin",
  description: "Internal moderation console for SoccerConnect",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We still fetch the user (to show their email / name in the header if we want),
  // but we do NOT redirect here anymore. Auth gating is middleware's job.
  const user = await getCurrentUser();

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

              {/* Tiny user indicator if you want it in the header */}
              {user ? (
                <span className="text-gray-500 text-xs">
                  {user.email ?? "Signed in"}
                </span>
              ) : null}

              <Link
                href="/api/auth/signout"
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </Link>
            </nav>
          </div>
        </header>

        {/* Main app content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>

        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
