// src/app/protected/clubs/page.tsx

import { requireUser } from "@/utils/auth";
import { createServerClientInstance } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAllClubs() {
  // create a Supabase server client bound to cookies
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase
    .from("clubs")
    .select("id, club_name, city, state, website")
    .order("state", { ascending: true })
    .order("club_name", { ascending: true });

  if (error) {
    console.error("[clubs page] error fetching clubs:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function ClubsPage() {
  // enforce authentication (redirects to /login if not logged in)
  await requireUser();

  const clubs = await getAllClubs();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">
        Texas Clubs (Admin View)
      </h1>

      {clubs.length === 0 ? (
        <div className="text-sm text-gray-500">No clubs found.</div>
      ) : (
        <div className="space-y-3">
          {clubs.map((c: any) => (
            <div
              key={c.id}
              className="border rounded p-3 text-sm flex flex-col bg-white"
            >
              <div className="font-medium text-gray-900">{c.club_name}</div>
              <div className="text-gray-600">
                {c.city}, {c.state}
              </div>
              {c.website && (
                <div className="text-gray-500 text-xs break-all">
                  {c.website}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
