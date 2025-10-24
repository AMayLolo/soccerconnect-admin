// admin-web/src/app/protected/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// 🔹 Server-side Supabase client
function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = getServerClient();

  // ✅ Check for authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold">
              SoccerConnect <span className="font-normal text-gray-500">• Admin</span>
            </h1>
          </div>
          <a
            href="/auth/signout"
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Sign out
          </a>
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="flex">
          {/* SIDEBAR */}
          <aside className="w-56 min-h-screen bg-white border-r p-4">
            <nav className="space-y-2 text-sm font-medium">
              <Link href="/protected" className="block px-2 py-1.5 rounded hover:bg-gray-100">
                Dashboard
              </Link>
              <Link href="/protected/reviews" className="block px-2 py-1.5 rounded hover:bg-gray-100">
                Reviews
              </Link>
              <Link href="/protected/reports" className="block px-2 py-1.5 rounded hover:bg-gray-100">
                Reports
              </Link>
            </nav>
          </aside>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
