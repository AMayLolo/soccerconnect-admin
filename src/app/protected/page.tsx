import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to SoccerConnect Admin
        </h1>
        <p className="text-gray-600 mt-2">
          Use this dashboard to manage clubs, review reports, and moderate user feedback.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Clubs */}
        <Link
          href="/protected/club"
          className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-gray-800">⚽ Clubs</h2>
          <p className="text-gray-600 mt-2 text-sm">
            View and manage all registered clubs.
          </p>
        </Link>

        {/* Reports */}
        <Link
          href="/protected/reports"
          className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-gray-800">📋 Reports</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Review flagged reports and take action.
          </p>
        </Link>

        {/* Reviews */}
        <Link
          href="/protected/reviews"
          className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold text-gray-800">💬 Reviews</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Moderate user-submitted reviews and ratings.
          </p>
        </Link>
      </section>

      <footer className="pt-6 border-t text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} SoccerConnect Admin
      </footer>
    </div>
  );
}
