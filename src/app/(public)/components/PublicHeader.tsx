"use client";

import Link from "next/link";
import Image from "next/image";

export default function PublicHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logos/soccerconnect_logo.svg"
            width={34}
            height={34}
            alt="SoccerConnect"
          />
          <span className="font-semibold text-lg tracking-tight">
            SoccerConnect
          </span>
        </Link>

        {/* Login */}
        <Link
          href="/auth/login"
          className="px-4 py-1.5 rounded-md border font-medium text-sm hover:bg-gray-50"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
