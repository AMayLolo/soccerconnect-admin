import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "./MobileSidebar";
import { SidebarNav } from "./SidebarNav";
import { AdminHeader } from "./AdminHeader";

export const metadata = {
  title: "SoccerConnect Admin",
  description: "Admin portal for SoccerConnect",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex bg-background text-foreground">

        {/* ===== Desktop Sidebar ===== */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-card">
          <div className="p-6 border-b flex items-center gap-3">
            <Image
              src="/logos/soccerconnect_logo.svg"
              alt="SoccerConnect Logo"
              width={34}
              height={34}
            />
            <span className="font-bold text-xl">Admin</span>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <SidebarNav />
          </nav>
        </aside>

        {/* ===== Main Content ===== */}
        <div className="flex flex-col w-full min-h-screen">

          {/* ===== Header ===== */}
          <header className="w-full">
            {/* Mobile */}
            <div className="lg:hidden flex items-center justify-between px-4 h-16 border-b bg-card">
              <MobileSidebar />

              <Link
                href="/admin"
                className="flex items-center gap-2 font-semibold text-lg"
              >
                <Image
                  src="/logos/soccerconnect_logo.svg"
                  alt="SoccerConnect Logo"
                  width={28}
                  height={28}
                />
                Admin
              </Link>

              <ThemeToggle />
            </div>

            {/* Desktop */}
            <div className="hidden lg:block">
              <AdminHeader />
            </div>
          </header>

          {/* ===== Page Content ===== */}
          <main className="flex-1 p-4 lg:p-8">{children}</main>
        </div>

      </body>
    </html>
  );
}
