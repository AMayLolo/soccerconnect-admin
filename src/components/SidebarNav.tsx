"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Flag, CheckCircle, Star } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/protected", icon: Home },
  { name: "Clubs", href: "/protected/clubs", icon: Users },
  { name: "Flagged", href: "/protected/flagged", icon: Flag },
  { name: "Approvals", href: "/protected/approvals", icon: CheckCircle },
  { name: "Reviews", href: "/protected/reviews", icon: Star },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-5 py-2.5 text-sm rounded-md mx-2 ${
              active
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="h-5 w-5" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
