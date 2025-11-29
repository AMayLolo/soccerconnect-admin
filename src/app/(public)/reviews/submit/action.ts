// src/app/(public)/reviews/submit/action.ts
"use server";

import { env } from "@/env.mjs";
import { moderateReview } from "@/lib/moderateReview";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitReview(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Extract fields
  const club_id = formData.get("club_id")?.toString();
  const rating = Number(formData.get("rating"));
  const comment = formData.get("comment")?.toString() ?? "";

  if (!club_id) throw new Error("Missing club_id");
  if (!rating || rating < 1 || rating > 5)
    throw new Error("Invalid rating");

  // Must be logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) redirect("/auth/login");

  const user_id = session.user.id;

  // AI Moderation
  const moderation = await moderateReview(comment);

  // Check if user already reviewed this club
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("club_id", club_id)
    .eq("user_id", user_id)
    .limit(1)
    .single();

  if (existing) {
    // UPDATE review
    await supabase
      .from("reviews")
      .update({
        rating,
        comment,
        hidden: moderation.hidden,
        flagged: moderation.flagged,
        report_reason: moderation.reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    redirect(`/clubs/${club_id}#reviews`);
  }

  // INSERT new review
  await supabase.from("reviews").insert({
    club_id,
    user_id,
    rating,
    comment,
    hidden: moderation.hidden,
    flagged: moderation.flagged,
    report_reason: moderation.reason,
  });

  redirect(`/clubs/${club_id}#reviews`);
}
