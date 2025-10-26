import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";
import { createClient } from "@supabase/supabase-js";

type ClubRecord = {
  id: string;
  club_name: string | null;
  city: string | null;
  state: string | null;
  website_url: string | null;
  competition_level: string | null;
  last_scraped_at: string | null;
};

async function getTexasClubs(): Promise<ClubRecord[]> {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    throw new Error(
      "Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  // Server-side Supabase client using service role
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // grab only Texas clubs for now
  const { data, error } = await adminClient
    .from("clubs")
    .select(
      `
        id,
        club_name,
        city,
        state,
        website_url,
        competition_level,
        last_scraped_at
      `
    )
    .eq("state", "TX")
    .order("club_name", { ascending: true });

  if (error) {
    console.error("[clubs] error loading clubs:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function ClubsPage() {
  // 1. gate this route
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 2. load data
  const clubs = await getTexasClubs();

  // 3. render ui
  return (
    <main className="p-6 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Texas Clubs ({clubs.length})
        </h1>
        <p className="text-sm text-gray-500">
          Pulled from NTX, CAYSA, ECNL scrape. You’re seeing TX only.
        </p>
      </header>

      <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3 whitespace-nowrap">Last scraped</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {clubs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400 text-sm"
                >
                  No clubs found.
                </td>
              </tr>
            ) : (
              clubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {club.club_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {club.city || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {club.competition_level || "—"}
                  </td>
                  <td className="px-4 py-3 text-blue-600 underline">
                    {club.website_url ? (
                      <a
                        href={
                          club.website_url.startsWith("http")
                            ? club.website_url
                            : `https://${club.website_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {club.website_url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {club.last_scraped_at
                      ? new Date(club.last_scraped_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
