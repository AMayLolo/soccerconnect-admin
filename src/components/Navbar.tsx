// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import HeaderLogo from "@/components/HeaderLogo";

export default function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4">
        <HeaderLogo />

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Link href="/protected" className="hover:text-blue-600 dark:hover:text-teal-400 transition-colors">
            Dashboard
          </Link>
          <Link href="/protected/clubs" className="hover:text-blue-600 dark:hover:text-teal-400 transition-colors">
            Clubs
          </Link>
          <Link href="/protected/flagged" className="hover:text-blue-600 dark:hover:text-teal-400 transition-colors">
            Flagged
          </Link>
          <Link href="/protected/approvals" className="hover:text-blue-600 dark:hover:text-teal-400 transition-colors">
            Approvals
          </Link>
        </nav>
      </div>
    </header>
  );
}
