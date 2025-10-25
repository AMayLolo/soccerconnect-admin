import { supabase } from "./supabaseClient";
import type { ClubRecord } from "./scrapeSampleDirectory";

export async function saveClubs(clubs: ClubRecord[]) {
  if (!clubs || clubs.length === 0) {
    console.log("No clubs to save.");
    return;
  }

  const { data, error } = await supabase
    .from("clubs")
    .upsert(
      clubs.map((c) => ({
        club_name: c.club_name,
        city: c.city,
        state: c.state,
        website_url: c.website_url,
        tryout_info_url: c.tryout_info_url ?? null,
        ages: c.ages ?? null,
        competition_level: c.competition_level ?? null,
        badge_logo_url: c.badge_logo_url ?? null,
        about: c.about ?? null,
        last_scraped_at: c.last_scraped_at,
      })),
      {
        // you'll need a unique constraint on (club_name, city, state) in Supabase
        onConflict: "club_name,city,state",
        ignoreDuplicates: false,
      }
    )
    .select();

  if (error) {
    console.error("Error saving clubs:", error);
    return;
  }

  console.log(`Saved ${data?.length ?? 0} clubs to Supabase`);
}
