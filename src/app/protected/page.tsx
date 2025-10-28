import Link from "next/link";
import { getCurrentUser } from "@/utils/auth";

export const metadata = {
  title: "Admin Dashboard | SoccerConnect",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold text-gray-900">
        Welcome back, {user?.email?.split("@")[0] || "Admin"} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Clubs */}
        <Link
          href="/protected/clubs"
          className="p-6 rounded-xl bg-white border hover:border-blue-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-1">Clubs</h2>
          <p className="text-gray-500 text-sm">
            Manage club profiles, update details, and verify league info.
          </p>
        </Link>

        {/* Reports */}
        <Link
          href="/protected/reports"
          className="p-6 rounded-xl bg-white border hover:border-blue-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-1">Flagged Reports</h2>
          <p className="text-gray-500 text-sm">
            Review and resolve reported reviews or content.
          </p>
        </Link>

        {/* Reviews */}
        <Link
          href="/protected/reviews"
          className="p-6 rounded-xl bg-white border hover:border-blue-400 hover:shadow-md transition"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-1">Reviews</h2>
          <p className="text-gray-500 text-sm">
            Moderate user reviews and feedback from across clubs.
          </p>
        </Link>
      </div>
    </main>
  );
}
