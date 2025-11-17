"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flag,
  Users,
  Layers,
  Settings,
  SquarePen,
  ShieldCheck,
} from "lucide-react";
import clsx from "clsx";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/admin/protected/clubs",
    label: "Clubs",
    icon: Layers,
  },
  {
    href: "/admin/protected/approvals",
    label: "Approvals",
    icon: ShieldCheck,
  },
  {
    href: "/admin/protected/flagged",
    label: "Flagged",
    icon: Flag,
  },
  {
    href: "/admin/protected/reviews",
    label: "Reviews",
    icon: SquarePen,
  },
  {
    href: "/admin/protected/profile",
    label: "Profile",
    icon: Users,
  },
  {
    href: "/admin/protected/status",
    label: "System Status",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full text-sm">
      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
