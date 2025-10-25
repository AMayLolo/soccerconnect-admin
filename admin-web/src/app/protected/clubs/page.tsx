// src/app/protected/clubs/page.tsx

import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clubs | SoccerConnect Admin",
  description: "View and manage club data from scrapers.",
};

async function getClubs() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env vars. Check your .env.local file.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, website_url, competition_level, last_scraped_at")
    .eq("state", "TX")
    .order("club_name", { ascending: true });

  if (error) {
    console.error("Error fetching clubs:", error);
    return [];
  }

  return data ?? [];
}

function Cell({ value }: { value?: string | null }) {
  const empty = !value || value.trim() === "";
  return (
    <span className={empty ? "text-gray-400 italic" : ""}>
      {empty ? "—" : value}
    </span>
  );
}

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Texas Clubs</h1>
      <p className="text-gray-500 mb-6">
        {clubs.length} clubs imported from North Texas Soccer.
      </p>

      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 text-xs uppercase">
              <th className="text-left p-3">Club</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Website</th>
              <th className="text-left p-3">Level</th>
              <th className="text-left p-3">Scraped</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{club.club_name}</td>
                <td className="p-3">
                  <Cell value={club.city} />
                </td>
                <td className="p-3">
                  {club.website_url ? (
                    <a
                      href={
                        club.website_url.startsWith("http")
                          ? club.website_url
                          : `https://${club.website_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {club.website_url}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="p-3">
                  <Cell value={club.competition_level} />
                </td>
                <td className="p-3 text-gray-500 text-xs">
                  {club.last_scraped_at
                    ? new Date(club.last_scraped_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Data auto-synced from your scraper. You can later add an “Edit Club” modal to enrich each entry.
      </p>
    </main>
  );
}
