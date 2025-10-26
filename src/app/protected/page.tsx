// src/app/protected/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProtectedHome() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Welcome to SoccerConnect Admin. Choose what you want to manage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/protected/clubs"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-medium text-gray-900">
            Clubs
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Browse and audit clubs in Texas.
          </div>
        </Link>

        <Link
          href="/protected/flagged"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-medium text-gray-900">
            Flagged Reports
          </div>
          <div className="text-xs text-gray-500 mt-1">
            See parent-reported issues and mark them resolved.
          </div>
        </Link>

        <Link
          href="/protected/reviews"
          className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition"
        >
          <div className="text-sm font-medium text-gray-900">
            Reviews
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Monitor and moderate incoming reviews.
          </div>
        </Link>
      </div>
    </div>
  );
}
