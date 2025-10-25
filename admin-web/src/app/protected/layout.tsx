import { getCurrentUser } from "@/utils/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
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
  // ✅ Server-side authentication check
  const user = await getCurrentUser();

  if (!user) {
    console.log("ProtectedLayout: no user found — redirecting to /login");
    redirect("/login");
  }

  console.log("ProtectedLayout: logged in as", user.email);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* 🔹 Top Nav */}
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
                className="hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/protected/flagged"
                className="hover:text-blue-600 transition-colors"
              >
                Flagged
              </Link>
              <Link
                href="/protected/reports"
                className="hover:text-blue-600 transition-colors"
              >
                Reports
              </Link>
              <Link
                href="/auth/signout"
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                Sign Out
              </Link>
            </nav>
          </div>
        </header>

        {/* 🔹 Page Content */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
          {children}
        </main>

        {/* 🔹 Toast notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#111",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            },
            success: {
              iconTheme: {
                primary: "#16a34a",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dc2626",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
