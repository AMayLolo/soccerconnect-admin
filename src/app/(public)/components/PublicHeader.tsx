"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicHeader() {
  return (
    <header className="w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/soccerconnect_logo.svg"
            alt="SoccerConnect"
            width={40}
            height={40}
          />
          <span className="text-xl font-semibold">SoccerConnect</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/clubs" className="hover:text-primary">
            Clubs
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
