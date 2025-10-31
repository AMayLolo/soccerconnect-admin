"use client";

import Link from "next/link";

type AdminHeaderProps = {
  active?: "dashboard" | "clubs" | "flagged" | "reviews" | "approvals";
};

export default function AdminHeader({ active }: AdminHeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <img
            src="/branding/logos/soccerconnect_logo.svg"
            alt="SoccerConnect Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-lg font-semibold text-gray-900">
            SoccerConnect Admin
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm font-medium">
          <Link
            href="/protected"
            className={`hover:text-blue-600 ${
              active === "dashboard" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/protected/clubs"
            className={`hover:text-blue-600 ${
              active === "clubs" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Clubs
          </Link>
          <Link
            href="/protected/flagged"
            className={`hover:text-blue-600 ${
              active === "flagged" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Flagged
          </Link>
          <Link
            href="/protected/reviews"
            className={`hover:text-blue-600 ${
              active === "reviews" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Reviews
          </Link>
          <Link
            href="/protected/approvals"
            className={`hover:text-blue-600 ${
              active === "approvals" ? "text-blue-600" : "text-gray-700"
            }`}
          >
            Approvals
          </Link>
        </nav>
      </div>
    </header>
  );
}
