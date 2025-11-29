"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/protected", label: "Dashboard" },
    { href: "/protected/clubs", label: "Clubs" },
    { href: "/protected/reviews", label: "Reviews" },
    { href: "/protected/approvals", label: "Approvals" },
    { href: "/protected/flagged", label: "Flagged Reviews" },
    { href: "/protected/club-recommendations", label: "Recommendations" },
    { href: "/protected/status", label: "System Status" },
    { href: "/protected/profile", label: "Profile" },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col p-6">
      {/* Logo */}
      <Link href="/protected" className="text-xl font-semibold mb-8">
        Admin Panel
      </Link>

      {/* New Club Button */}
      <Link
        href="/protected/clubs/new"
        className="mb-6 w-full bg-black text-white text-center py-2 rounded-md hover:bg-gray-900 transition"
      >
        + New Club
      </Link>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition",
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} SoccerConnect
      </div>
    </aside>
  );
}
