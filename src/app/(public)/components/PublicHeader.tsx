"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link href="/" className="font-semibold text-xl">
          SoccerConnect
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/clubs" className={pathname === "/clubs" ? "text-black font-medium" : "text-gray-600"}>
            Clubs
          </Link>
          <Link href="/reviews/submit" className={pathname?.startsWith("/reviews") ? "text-black font-medium" : "text-gray-600"}>
            Leave Review
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-black">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
