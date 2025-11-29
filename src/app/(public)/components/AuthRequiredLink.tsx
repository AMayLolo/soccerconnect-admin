"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthRequiredLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (isAuthenticated === false) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <Link href={href} onClick={handleClick} className={className}>
        {children}
      </Link>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1c3f60] mb-2">Registration Required</h2>
              <p className="text-gray-600">
                You must be registered to write a review. Please create an account or sign in to continue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/signup"
                className="flex-1 px-4 py-2.5 bg-[#0d7a9b] text-white rounded-lg hover:bg-[#0a5f7a] transition-colors font-medium text-center"
              >
                Create Account
              </Link>
              <Link
                href="/auth/login"
                className="flex-1 px-4 py-2.5 border-2 border-[#0d7a9b] text-[#0d7a9b] rounded-lg hover:bg-[#0d7a9b] hover:text-white transition-colors font-medium text-center"
              >
                Sign In
              </Link>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
