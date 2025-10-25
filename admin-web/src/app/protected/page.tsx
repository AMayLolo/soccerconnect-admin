// src/app/protected/page.tsx
import { createServerClientInstance } from "@/utils/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Load dashboard data using the unified client
async function getDashboardData() {
  const supabase = await createServerClientInstance();

  const { data: clubsData } = await supabase
    .from("clubs")
    .select("id, name");

  const { data: latestReviewsData } = await supabase
    .from("reviews")
    .select(
      `
        id,
        rating,
        comment,
        category,
        inserted_at,
        club_id (
          name
        )
      `
    )
    .order("inserted_at", { ascending: false })
    .limit(5);

  const { data: flaggedPreviewData } = await supabase
    .from("review_reports")
    .select(
      `
        id,
        reason,
        reported_at,
        resolved,
        review_id (
          comment,
          club_id (
            name
          )
        )
      `
    )
    .order("reported_at", { ascending: false })
    .limit(5);

  const clubCount = clubsData?.length ?? 0;

  const latestReviews = (latestReviewsData ?? []).map((r: any) => ({
    id: r.id,
    rating: r.rating ?? null,
    comment: r.comment ?? null,
    category: r.category ?? null,
    inserted_at: r.inserted_at ?? "",
    club_name: r.club_id?.name ?? "Unknown Club",
  }));

  const flaggedPreview = (flaggedPreviewData ?? []).map((fr: any) => ({
    report_id: fr.id,
    reason: fr.reason ?? null,
    reported_at: fr.reported_at ?? "",
    club_name: fr.review_id?.club_id?.name ?? "Unknown Club",
    excerpt: fr.review_id?.comment
      ? fr.review_id.comment.slice(0, 120)
      : "(no comment)",
    resolved: !!fr.resolved,
  }));

  const unresolvedCount = flaggedPreview.filter((f) => !f.resolved).length;

  return {
    clubCount,
    latestReviews,
    flaggedPreview,
    unresolvedCount,
  };
}

export default async function DashboardPage() {
  const {
    clubCount,
    latestReviews,
    flaggedPreview,
    unresolvedCount,
  } = await getDashboardData();

  return (
    <section className="space-y-8">
      {/* ... SAME RENDER AS BEFORE ... */}
      {/* I'm not repeating the whole JSX you gave, keep that exactly.
         The only change is: no redirect(), no auth logic here. */}
    </section>
  );
}
