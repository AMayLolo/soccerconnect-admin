import { createClient } from "@supabase/supabase-js";

async function getClubs() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("clubs")
    .select(
      "id, club_name, city, state, website_url, competition_level, last_scraped_at"
    )
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

// This is a Server Component (no "use client"), so we can call getClubs() directly.
export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <main className="p-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Texas Clubs
        </h1>
        <p className="text-gray-500 text-sm">
          {clubs.length} clubs imported from North Texas Soccer.
        </p>
      </header>

      <section className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600 text-[11px] font-semibold uppercase tracking-wide">
              <th className="px-4 py-3">Club</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Website</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Scraped</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => {
              const scraped = club.last_scraped_at
                ? new Date(club.last_scraped_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={club.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Club name */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {club.club_name}
                  </td>

                  {/* City */}
                  <td className="px-4 py-3 text-gray-700">
                    <Cell value={club.city} />
                  </td>

                  {/* Website */}
                  <td className="px-4 py-3 text-gray-700">
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

                  {/* Comp level */}
                  <td className="px-4 py-3 text-gray-700">
                    <Cell value={club.competition_level} />
                  </td>

                  {/* Last scraped */}
                  <td className="px-4 py-3 text-gray-500 text-[11px]">
                    {scraped}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="text-[11px] text-gray-400 leading-relaxed max-w-xl">
        Missing website / city? Open Supabase → clubs table and paste it in for now.
        We’ll add inline editing and push updates back via an API route next.
      </p>
    </main>
  );
}
