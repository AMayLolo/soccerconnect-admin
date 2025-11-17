import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import FlaggedTableClient from "./FlaggedTableClient";

export default async function FlaggedPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {},
      },
    }
  );

  const { data: reports, error } = await supabase
    .from("reports") // ✅ your table
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading flagged reports:", error.message);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Flagged Reports</h1>
      <FlaggedTableClient reports={reports || []} />
    </div>
  );
}
