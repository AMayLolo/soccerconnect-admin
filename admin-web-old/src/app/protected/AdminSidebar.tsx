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
    <aside className="w-60 shrink-0 border-r border-zinc-200 bg-white">
      <div className="p-5 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
            SC
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900">SoccerConnect</span>
            <span className="text-xs text-zinc-500">Admin</span>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1 text-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 ${
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
