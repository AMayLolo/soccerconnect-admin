"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/protected/clubs", label: "Clubs" },
  { href: "/admin/protected/reviews", label: "Reviews" },
  { href: "/admin/protected/approvals", label: "Approvals" },
  { href: "/admin/protected/flagged", label: "Flagged" },
  { href: "/admin/protected/status", label: "Status" },
  { href: "/admin/protected/profile", label: "Profile" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 p-6 space-y-6">
      <Link href="/admin" className="text-xl font-semibold">
        Admin Panel
      </Link>

      <nav className="space-y-2">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-sm ${
              pathname.startsWith(item.href)
                ? "bg-black text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
