import { getSupabaseServerReadOnly } from "@/lib/supabaseServerReadOnly";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = getSupabaseServerReadOnly();

    // Get most recent reviews to infer recently reviewed clubs
    const { data: recentReviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("club_id, inserted_at")
      .order("inserted_at", { ascending: false })
      .limit(50);

    if (reviewsError || !recentReviews) {
      const resErr = NextResponse.json([], { status: 200 });
      resErr.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      return resErr;
    }

    const idsOrdered: string[] = [];
    const seen = new Set<string>();
    for (const r of recentReviews) {
      if (r.club_id && !seen.has(r.club_id)) {
        idsOrdered.push(r.club_id);
        seen.add(r.club_id);
      }
      if (idsOrdered.length >= 12) break;
    }

    if (idsOrdered.length === 0) {
      const resEmpty = NextResponse.json([], { status: 200 });
      resEmpty.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      return resEmpty;
    }

    const { data: clubs, error: clubsError } = await supabase
      .from("clubs")
      .select("id, club_name, city, state, logo_url, badge_logo_url")
      .in("id", idsOrdered);

    if (clubsError || !clubs) {
      const resErr = NextResponse.json([], { status: 200 });
      resErr.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      return resErr;
    }

    // Preserve ordering by recent review
    const orderMap = new Map(idsOrdered.map((id, idx) => [id, idx] as const));
    const ordered = clubs.slice().sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));

    const res = NextResponse.json(ordered);
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (err) {
    console.error("Failed to fetch recently reviewed clubs", err);
    const res = NextResponse.json([], { status: 200 });
    res.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res;
  }
}
