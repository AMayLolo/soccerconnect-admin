// src/app/protected/page.tsx

import { requireUser } from "@/utils/auth";
import { getServiceClient } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardData() {
  const supabase = getServiceClient();

  // grab some summary data for the dashboard
  const [clubsRes, flaggedRes, reviewsRes] = await Promise.all([
    supabase
      .from("clubs")
      .select("id, club_name, city, state, website")
      .order("state", { ascending: true })
      .order("club_name", { ascending: true })
      .limit(10),

    supabase
      .from("review_flags")
      .select("id, review_id, reason, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),

    supabase
      .from("reviews")
      .select(
        "id, club_id, rating, comment, created_at, club:clubs(club_name, state)"
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    clubs: clubsRes.data ?? [],
    flagged: flaggedRes.data ?? [],
    recentReviews: reviewsRes.data ?? [],
  };
}

export default async function ProtectedHomePage() {
  // ensure you're logged in. if not, this will redirect("/login")
  await requireUser();

  const data = await getDashboardData();

  return (
    <main className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>
        <nav className="flex gap-4 text-sm text-blue-600">
          <Link href="/protected/clubs" className="hover:underline">
            Clubs
          </Link>
          <Link href="/protected/flagged" className="hover:underline">
            Flagged
          </Link>
          <Link href="/protected/reviews" className="hover:underline">
            Reviews
          </Link>
        </nav>
      </header>

      {/* Clubs preview */}
      <section className="bg-white border rounded p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-medium text-gray-800">Clubs (sample)</h2>
          <Link
            href="/protected/clubs"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {data.clubs.length === 0 ? (
          <div className="text-sm text-gray-500">No clubs found.</div>
        ) : (
          <ul className="divide-y text-sm">
            {data.clubs.map((club: any) => (
              <li key={club.id} className="py-2">
                <div className="font-medium text-gray-900">
                  {club.club_name}
                </div>
                <div className="text-gray-600">
                  {club.city}, {club.state}
                </div>
                <div className="text-gray-500 text-xs break-all">
                  {club.website}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Flagged preview */}
      <section className="bg-white border rounded p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-medium text-gray-800">Flagged Reports</h2>
          <Link
            href="/protected/flagged"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {data.flagged.length === 0 ? (
          <div className="text-sm text-gray-500">Nothing flagged 🎉</div>
        ) : (
          <ul className="divide-y text-sm">
            {data.flagged.map((flag: any) => (
              <li key={flag.id} className="py-2">
                <div className="font-medium text-gray-900">
                  Review #{flag.review_id}
                </div>
                <div className="text-gray-600 text-xs">
                  {flag.reason} — {flag.status}
                </div>
                <div className="text-gray-500 text-[11px]">
                  {flag.created_at}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Reviews preview */}
      <section className="bg-white border rounded p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-medium text-gray-800">Recent Reviews</h2>
          <Link
            href="/protected/reviews"
            className="text-xs text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {data.recentReviews.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet.</div>
        ) : (
          <ul className="divide-y text-sm">
            {data.recentReviews.map((rev: any) => (
              <li key={rev.id} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">
                    {rev.club?.club_name ?? "Unknown Club"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rev.rating}/5
                  </div>
                </div>
                <div className="text-gray-700 text-sm">
                  {rev.comment || "(no comment)"}
                </div>
                <div className="text-gray-500 text-[11px]">
                  {rev.created_at}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
