// src/app/api/reviews/list/route.ts
import { env } from "@/env.mjs";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("club_id");
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? 10);

  if (!clubId) {
    return NextResponse.json({ error: "Missing club_id" }, { status: 400 });
  }

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  let query = supabase
    .from("reviews")
    .select(`id, rating, comment, reviewer_type, hidden, flagged, inserted_at, profiles(full_name)`)
    .eq("club_id", clubId)
    .order("inserted_at", { ascending: false})
    .limit(limit);

  if (cursor) {
    query = query.lt("inserted_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const last = data?.[data.length - 1];
  const nextCursor = last ? last.inserted_at : null;

  return NextResponse.json({
    reviews: data,
    nextCursor,
  });
}
