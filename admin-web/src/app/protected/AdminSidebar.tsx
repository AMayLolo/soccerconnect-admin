// src/app/protected/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/protected", label: "Dashboard" },
  { href: "/protected/reviews", label: "Reviews" },
  { href: "/protected/flagged", label: "Flagged" },
  { href: "/protected/reports", label: "Reports" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 border-r border-zinc-300 bg-white text-zinc-900">
      <div className="p-4 flex items-start gap-3 border-b border-zinc-300">
        <div className="h-10 w-10 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
          SC
        </div>

        <div className="flex flex-col">
          <div className="text-sm font-semibold text-zinc-900">
            SoccerConnect • Admin
          </div>
          <div className="text-xs text-zinc-500">
            Internal moderation dashboard
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 text-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-md px-3 py-2",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-900",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
