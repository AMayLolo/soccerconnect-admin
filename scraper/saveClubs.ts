import { supabase } from "./supabaseClient";
import type { ClubRecord } from "./scrapeSampleDirectory";

/**
 * saveClubs
 *
 * - Takes array of ClubRecord
 * - Adds normalized_name (lowercased club_name) before insert
 * - Upserts into Supabase
 *
 * REQUIREMENTS IN DB:
 *
 * 1. clubs table has:
 *    - club_name text
 *    - state text
 *    - normalized_name text
 *      (this should be kept in sync with club_name via trigger)
 *
 * 2. UNIQUE constraint exists on (normalized_name, state), e.g.:
 *
 *    ALTER TABLE clubs
 *    ADD CONSTRAINT clubs_unique_normalized_name_state
 *    UNIQUE (normalized_name, state);
 *
 * Now Supabase can do onConflict("normalized_name,state")
 * without throwing 42P10.
 */
export async function saveClubs(clubs: ClubRecord[]) {
  console.log(`Saving ${clubs.length} clubs to Supabase`);

  // Shape DB rows
  const rows = clubs.map((c) => ({
    club_name: c.club_name,
    city: c.city ?? "",
    state: c.state ?? "",
    website_url: c.website_url ?? "",
    tryout_info_url: c.tryout_info_url ?? null,
    ages: c.ages ?? null,
    competition_level: c.competition_level ?? null,
    badge_logo_url: c.badge_logo_url ?? null,
    about: c.about ?? null,
    last_scraped_at: c.last_scraped_at ?? new Date().toISOString(),

    // important for upsert uniqueness
    normalized_name: c.club_name.toLowerCase(),
  }));

  const { data, error } = await supabase
    .from("clubs")
    .upsert(rows, {
      // must match the UNIQUE constraint in the DB
      onConflict: "normalized_name,state",
    })
    .select(); // .select() so Supabase returns rows for logging/debug

  if (error) {
    console.error("Error saving clubs:", error);
  } else {
    console.log(`Saved ${rows.length} clubs to Supabase`);
  }
}
