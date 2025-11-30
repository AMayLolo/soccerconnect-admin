"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { AuthResponse, Session, User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthRequiredLink from "./AuthRequiredLink";

export default function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then((response: AuthResponse) => {
      setUser(response.data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/branding/logos/logo-shield.svg" 
            alt="SoccerConnect" 
            width={56} 
            height={56}
            className="transition-transform group-hover:scale-105 w-14 h-14"
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
            href="/about" 
            className={pathname === "/about" 
              ? "text-[#0d7a9b] font-semibold" 
              : "text-gray-600 hover:text-[#0d7a9b] transition-colors"
            }
          >
            About
          </Link>
          <AuthRequiredLink 
            href="/reviews/submit" 
            className={pathname?.startsWith("/reviews") 
              ? "text-[#0d7a9b] font-semibold" 
              : "text-gray-600 hover:text-[#0d7a9b] transition-colors"
            }
          >
            Leave Review
          </AuthRequiredLink>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {loading ? (
            // Loading state
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : user ? (
            // Logged in state
            <>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <UserIcon className="h-4 w-4 text-[#0d7a9b]" />
                <span className="text-sm font-medium text-gray-700">
                  {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#1c3f60] font-medium transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            // Logged out state
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
