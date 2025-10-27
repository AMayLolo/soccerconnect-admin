// src/app/protected/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/utils/auth";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();
  if (!user) redirect("/login");

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        {/* ===== Top Navbar ===== */}
        <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <span className="text-blue-600">⚽</span>
            <span>SoccerConnect Admin</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-[2px]">
              <span className="font-medium">{user?.email}</span>
              <span className="rounded-full bg-blue-600 px-2 py-[1px] text-[10px] font-semibold text-white">
                Admin
              </span>
            </div>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* ===== Page Layout Grid ===== */}
        <div className="flex min-h-[calc(100vh-56px)]">
          {/* ===== Sidebar ===== */}
          <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-neutral-200 bg-white p-4 shadow-sm md:flex">
            <nav className="space-y-1 text-sm">
              <SidebarLink href="/protected" label="Dashboard" />
              <SidebarLink href="/protected/flagged" label="Flagged Reports" />
              <SidebarLink href="/protected/reviews" label="Reviews" />
              <SidebarLink href="/protected/reports" label="Reports" />
              <SidebarLink href="/protected/status" label="System Status" />
            </nav>

            <div className="mt-auto border-t border-neutral-200 pt-3 text-[11px] text-neutral-500">
              © {new Date().getFullYear()} SoccerConnect
            </div>
          </aside>

          {/* ===== Main Content ===== */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-6xl">
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#333",
                    color: "#fff",
                  },
                }}
              />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

/* ===== Helper component for sidebar links ===== */
function SidebarLink({ href, label }: { href: string; label: string }) {
  const base =
    "block rounded-md px-3 py-2 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-blue-600 transition";
  const active =
    typeof window !== "undefined" && window.location.pathname === href
      ? "bg-blue-50 text-blue-700 font-semibold"
      : "";
  return (
    <Link href={href} className={`${base} ${active}`}>
      {label}
    </Link>
  );
}
