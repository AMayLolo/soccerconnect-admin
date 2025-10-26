// src/app/protected/clubs/page.tsx
import { requireUser } from "@/utils/auth";
import { createServerClientInstance } from "@/utils/supabase/server"; // this is your RLS-safe server supabase (anon key w/ cookies)
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Club = {
  id: string;
  club_name: string | null;
  city: string | null;
  state: string | null;
  website_url: string | null;
  last_scraped_at: string | null;
};

async function getClubs(): Promise<Club[]> {
  // this should be the same helper you already had in protected/page.tsx
  // which basically does:
  //   const supabase = await createServerClientInstance();
  //   const { data } = await supabase.from("clubs").select("*").limit(...)
  //
  // NOTE: we are not using the service role key here. This is fine for listing clubs
  // if your RLS policy allows read access to authenticated users.

  const supabase = await createServerClientInstance();
  const { data, error } = await supabase
    .from("clubs")
    .select(
      "id, club_name, city, state, website_url, last_scraped_at"
    )
    .order("club_name", { ascending: true });

  if (error) {
    console.error("[clubs/page] supabase clubs error:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function ClubsPage() {
  // 1. force auth – if not logged in, this will redirect("/login")
  const user = await requireUser();

  // 2. fetch club data
  const clubs = await getClubs();

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Texas Clubs
          </h1>
          <p className="text-sm text-gray-500">
            {user.email
              ? `Signed in as ${user.email}`
              : "Signed in"}
            . Showing {clubs.length} clubs in Supabase.
          </p>
        </div>

        <Link
          href="/protected"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* table / list */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-gray-700">Club</th>
              <th className="px-4 py-2 font-medium text-gray-700">City</th>
              <th className="px-4 py-2 font-medium text-gray-700">State</th>
              <th className="px-4 py-2 font-medium text-gray-700">
                Website
              </th>
              <th className="px-4 py-2 font-medium text-gray-700 whitespace-nowrap">
                Last Scraped
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {clubs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No clubs found.
                </td>
              </tr>
            ) : (
              clubs.map((club) => (
                <tr key={club.id ?? club.club_name}>
                  {/* Club name */}
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {club.club_name || "—"}
                  </td>

                  {/* City */}
                  <td className="px-4 py-3 text-gray-700">
                    {club.city || "—"}
                  </td>

                  {/* State */}
                  <td className="px-4 py-3 text-gray-700">
                    {club.state || "—"}
                  </td>

                  {/* Website */}
                  <td className="px-4 py-3">
                    {club.website_url ? (
                      <a
                        href={club.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {club.website_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  {/* Last scraped */}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {club.last_scraped_at
                      ? new Date(club.last_scraped_at).toLocaleString()
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
