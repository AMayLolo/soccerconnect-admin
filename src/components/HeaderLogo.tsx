// src/components/HeaderLogo.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeaderLogo() {
  return (
    <Link href="/protected" className="flex items-center gap-3">
      <div className="relative w-36 sm:w-40 md:w-44 h-auto">
        <Image
          src="/branding/logos/soccerconnect_logo.svg"
          alt="SoccerConnect Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className="sr-only">SoccerConnect</span>
    </Link>
  );
}
