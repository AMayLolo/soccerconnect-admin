import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import LogoImage from "@/components/LogoImage"; // ✅ Client component

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Admin console for managing soccer clubs and reports.",
};

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <LogoImage />
            <h1 className="text-lg font-semibold tracking-tight">
              SoccerConnect Admin
            </h1>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/protected"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Dashboard
            </Link>
            <Link
              href="/protected/clubs"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Clubs
            </Link>
            <Link
              href="/protected/flagged"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Flagged
            </Link>
            <Link
              href="/protected/reviews"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Reviews
            </Link>
            <Link
              href="/protected/approvals"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Approvals
            </Link>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-8 py-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Toasts */}
      <Toaster position="top-right" />
    </div>
  );
}
