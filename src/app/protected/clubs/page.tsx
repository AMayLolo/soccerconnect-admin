export const dynamic = "force-dynamic"
export const revalidate = 0

import StatsProvider from "@/components/StatsProvider"
import { getSupabaseServerReadOnly } from "@/lib/supabaseServerReadOnly"
import normalizeStatsKey from "@/utils/normalizeStatsKey"
import ClubsClient from "./ClubsClient"

export default async function ClubsPage() {
  const supabase = getSupabaseServerReadOnly()

  // Fetch initial clubs and counts server-side so initial HTML is populated and
  // protected from client auth/RLS issues.
  const [{ data: clubsData }, { data: countsRows }] = await Promise.all([
    supabase
      .from('clubs')
      .select('id, club_name, city, state, logo_url, about, founded')
      .order('club_name', { ascending: true }),
    // counts fetch: include club_name so we can fall back to this list if the
    // primary clubs query returns no rows (defensive). Avoid selecting
    // optional `description` here because some schemas don't have it.
    supabase
      .from('clubs')
      .select('id, club_name, logo_url, founded, city, state, about')
  ])

  // Defensive: if the first query returned no data (sometimes observed),
  // fall back to the second query's rows which include club_name now.
  const clubs = (clubsData as any) && (clubsData as any).length > 0 ? (clubsData as any) : (countsRows as any) || []

  // Compute counts server-side similar to the API route so StatsProvider has initial values
  const rows = (countsRows as any) || []
  const total = rows.length
  const incomplete = rows.reduce((acc: number, r: any) => {
    const bio = r?.about
    const missing = !r.logo_url || r.logo_url === '' || !bio || bio === '' || !r.founded || r.founded === '' || !r.city || r.city === '' || !r.state || r.state === ''
    return acc + (missing ? 1 : 0)
  }, 0)
  const complete = Math.max(0, total - incomplete)

  const initialMap: Record<string, number> = {}
  initialMap[normalizeStatsKey('clubs')] = total

  return (
    <StatsProvider initial={initialMap}>
      {/* ClubsClient is a client component that receives the server-fetched clubs */}
      <ClubsClient initialClubs={clubs} />
    </StatsProvider>
  )
}
