"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ParentDashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadParentData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setUserName(profile?.full_name || "Parent");

      // Reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating, comment, category, created_at, club_id, clubs(club_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      // Watchlist
      const { data: watchlistData } = await supabase
        .from("watchlist")
        .select("created_at, clubs(club_name, city, state, website_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setWatchlist(watchlistData || []);
      setLoading(false);
    }

    loadParentData();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading your dashboard...</p>;

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">
          Welcome back{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="text-gray-600">Here’s your activity overview:</p>
      </header>

      {/* ✅ Followed Clubs */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Followed Clubs</h2>
        {watchlist.length === 0 ? (
          <p className="text-gray-500">You haven’t followed any clubs yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {watchlist.map((w, i) => (
              <li
                key={i}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-bold text-lg mb-1">
                  {w.clubs?.club_name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  {w.clubs?.city}, {w.clubs?.state}
                </p>
                {w.clubs?.website_url && (
                  <a
                    href={w.clubs.website_url}
                    target="_blank"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Visit website
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ✅ Recent Reviews */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Your Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">You haven’t submitted any reviews yet.</p>
        ) : (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Club</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Comment</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">
                    {r.clubs?.club_name || `#${r.club_id}`}
                  </td>
                  <td className="px-4 py-2">{r.rating}</td>
                  <td className="px-4 py-2 capitalize">{r.category}</td>
                  <td className="px-4 py-2 text-gray-700">{r.comment}</td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
