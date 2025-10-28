"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function ClubOwnerDashboard() {
  const [club, setClub] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchClubData() {
      // Step 1: Get current user & their profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, club_id")
        .eq("id", user.id)
        .single();

      if (!profile?.club_id) return;

      // Step 2: Fetch club details
      const { data: clubData } = await supabase
        .from("clubs")
        .select("club_name, city, state, website_url, badge_logo_url")
        .eq("id", profile.club_id)
        .single();

      setClub(clubData);

      // Step 3: Fetch reviews for that club
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("rating, comment, category, created_at")
        .eq("club_id", profile.club_id)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);
      setLoading(false);
    }

    fetchClubData();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading club dashboard...</p>;
  if (!club) return <p className="text-center mt-8">No club data found.</p>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4">
        {club.badge_logo_url && (
          <img
            src={club.badge_logo_url}
            alt={`${club.club_name} badge`}
            className="w-16 h-16 rounded-md border"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{club.club_name}</h1>
          <p className="text-gray-600">
            {club.city}, {club.state}
          </p>
          <a
            href={club.website_url}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {club.website_url}
          </a>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-3">Recent Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Comment</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={i} className="border-t">
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
