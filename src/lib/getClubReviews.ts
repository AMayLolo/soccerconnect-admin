// src/lib/getClubReviews.ts

import { createServerClient } from "@supabase/ssr";
import { env } from "@/env.mjs";

export async function getClubReviews({
  clubId,
  limit = 10,
  cursor,
}: {
  clubId: string;
  limit?: number;
  cursor?: string | null;
}) {
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  let query = supabase
    .from("reviews")
    .select(`id, rating, comment, hidden, flagged, inserted_at, profiles(full_name)`)
    .eq("club_id", clubId)
    .order("inserted_at", { ascending: false }) // newest → oldest
    .limit(limit);

  if (cursor) {
    query = query.lt("inserted_at", cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  const last = data?.[data.length - 1];

  const nextCursor = last ? last.inserted_at : null;

  return {
    reviews: data,
    nextCursor,
  };
}
