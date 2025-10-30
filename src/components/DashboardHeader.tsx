"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function DashboardHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/protected/clubs", label: "Clubs" },
    { href: "/protected/flagged", label: "Flagged" },
    { href: "/protected/approvals", label: "Approvals" },
  ];

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-(--color-bg)">
      <nav className="flex gap-6">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`hover:text-(--color-teal) transition-colors ${
              pathname.includes(href)
                ? "text-(--color-teal) font-semibold"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Dark Mode Toggle */}
      <ThemeToggle />
    </header>
  );
}
