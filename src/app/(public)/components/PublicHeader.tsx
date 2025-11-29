"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/branding/logos/logo-shield.svg" 
            alt="SoccerConnect" 
            width={40} 
            height={40}
            className="transition-transform group-hover:scale-105"
          />
          <span className="font-bold text-xl text-[#1c3f60]">
            SoccerConnect
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link 
            href="/clubs" 
            className={pathname === "/clubs" 
              ? "text-[#0d7a9b] font-semibold" 
              : "text-gray-600 hover:text-[#0d7a9b] transition-colors"
            }
          >
            Browse Clubs
          </Link>
          <Link 
            href="/reviews/submit" 
            className={pathname?.startsWith("/reviews") 
              ? "text-[#0d7a9b] font-semibold" 
              : "text-gray-600 hover:text-[#0d7a9b] transition-colors"
            }
          >
            Leave Review
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/auth/login" 
            className="text-gray-600 hover:text-[#1c3f60] font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-2.5 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
