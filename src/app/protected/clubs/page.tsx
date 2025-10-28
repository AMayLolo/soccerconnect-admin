import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function ClubsPage() {
  // ✅ cookies() is async in Next.js 16
  const cookieStore = await cookies();

  // ✅ use the new getAll() helper built into cookieStore
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(), // no Array.from, just direct
      },
    }
  );

  const { data: clubs, error } = await supabase
    .from("clubs")
    .select("*")
    .order("name");

  if (error) {
    console.error("[ClubsPage] Supabase error:", error.message);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clubs</h1>
      {clubs?.length ? (
        <ul className="divide-y rounded-lg border bg-white">
          {clubs.map((club) => (
            <li key={club.id} className="p-4 hover:bg-gray-50">
              <div className="font-medium">{club.name}</div>
              <div className="text-sm text-gray-500">
                {club.city}, {club.state}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No clubs found.</p>
      )}
    </div>
  );
}
