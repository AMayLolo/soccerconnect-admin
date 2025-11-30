import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin";
import { getCurrentUser } from "@/utils/auth";
import { redirect } from "next/navigation";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirect=/protected/notifications");
  }

  const supabase = getSupabaseServerAdmin();

  // Fetch flagged items that need attention
  const [
    { data: flaggedReviews },
    { data: flaggedDiscussions },
    { data: pendingApprovals },
  ] = await Promise.all([
    // Flagged reviews (if column exists)
    supabase
      .from("reviews")
      .select("id, rating, inserted_at, club_id, clubs:club_id(club_name)")
      .eq("is_flagged", true)
      .order("inserted_at", { ascending: false })
      .limit(50)
      .then(result => result.error ? { data: [] } : result),
    // Flagged discussions (if column exists)
    supabase
      .from("discussions")
      .select("id, inserted_at, club_id, clubs:club_id(club_name)")
      .eq("is_flagged", true)
      .order("inserted_at", { ascending: false })
      .limit(50)
      .then(result => result.error ? { data: [] } : result),
    // Pending approvals
    supabase
      .from("profiles")
      .select("user_id, full_name, requested_role, status, inserted_at")
      .eq("status", "pending_review")
      .order("inserted_at", { ascending: false })
      .limit(50),
  ]);

  // Transform data
  const transformedReviews = flaggedReviews?.map(r => ({
    ...r,
    clubs: Array.isArray(r.clubs) && r.clubs.length > 0 ? r.clubs[0] : null
  })) || [];

  const transformedDiscussions = flaggedDiscussions?.map(d => ({
    ...d,
    clubs: Array.isArray(d.clubs) && d.clubs.length > 0 ? d.clubs[0] : null
  })) || [];

  return (
    <NotificationsClient 
      flaggedReviews={transformedReviews}
      flaggedDiscussions={transformedDiscussions}
      pendingApprovals={pendingApprovals || []}
    />
  );
}
