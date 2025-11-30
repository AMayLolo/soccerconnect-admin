import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import DiscussionsModerationClient from "./DiscussionsModerationClient";

export default async function AdminDiscussionsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch all discussions with club information
  const { data: discussions, error } = await supabase
    .from("discussions")
    .select(`
      id,
      inserted_at,
      club_id,
      clubs:club_id (
        id,
        club_name
      )
    `)
    .order("inserted_at", { ascending: false });

  if (error) {
    console.error("Error fetching discussions:", error);
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussions Moderation</h1>
          <p className="text-red-600">
            Error loading discussions: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Transform the data to match expected structure (clubs is returned as array from Supabase)
  const transformedDiscussions = discussions?.map(d => ({
    ...d,
    clubs: Array.isArray(d.clubs) && d.clubs.length > 0 ? d.clubs[0] : null
  })) || [];

  // Calculate stats
  const totalDiscussions = transformedDiscussions.length;
  const flaggedDiscussions = 0; // Flagging not available in current schema
  const removedDiscussions = 0; // Removal not available in current schema

  return (
    <DiscussionsModerationClient 
      initialDiscussions={transformedDiscussions}
      stats={{
        total: totalDiscussions,
        flagged: flaggedDiscussions,
        removed: removedDiscussions
      }}
    />
  );
}
