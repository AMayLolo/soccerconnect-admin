import type { SupabaseClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"

import ClubProfileView, {
    type ClubDiscussion,
    type ClubProfile,
    type ClubReview,
} from "@/components/clubs/ClubProfileView"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin"
import { getSupabaseServerReadOnly } from "@/lib/supabaseServerReadOnly"
import parseLeagues from "@/utils/parseLeagues"

export const revalidate = 300

export default async function PublicClubProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const selectFields = `
    id,
    club_name,
    name,
    logo_url,
    logo,
    city,
    state,
    location,
    founded,
    members_count,
    members,
    rating,
    total_reviews,
    status,
    competition_level,
    league,
    about,
    description,
    stats,
    contact_email,
    admin_email,
    email,
    contact_phone,
    admin_phone,
    phone
  `

  const fetchClub = (client: SupabaseClient) =>
    client.from("clubs").select(selectFields).eq("id", id).maybeSingle()

  let supabase = getSupabaseServerReadOnly()
  let { data: clubRow, error: clubError } = await fetchClub(supabase)

  if (clubError || !clubRow) {
    console.warn("anon fetch for public club failed, retrying with service role", clubError)
    supabase = getSupabaseServerAdmin()
    const fallback = await fetchClub(supabase)
    clubRow = fallback.data
    clubError = fallback.error
  }

  if (clubError) {
    console.error("Failed to load public club", clubError)
  }
  if (!clubRow) return notFound()

  const rawStats = (clubRow.stats ?? {}) as Record<string, number | string | null | undefined>

  const toNullableNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value
    if (typeof value === "string" && value.trim().length > 0) {
      const numeric = Number(value)
      if (Number.isFinite(numeric)) return numeric
    }
    return null
  }

  const statsValue = (key: "facilities" | "coaching" | "community" | "value") =>
    toNullableNumber(rawStats[key]) ?? toNullableNumber((clubRow as Record<string, unknown>)[`${key}_rating`])

  const clubProfile: ClubProfile = {
    id: clubRow.id,
    name: clubRow.club_name ?? clubRow.name ?? "Untitled Club",
    logo: clubRow.logo_url ?? clubRow.logo ?? null,
    location: [clubRow.city, clubRow.state].filter(Boolean).join(", ") || clubRow.location || "Location unavailable",
    founded: clubRow.founded ? String(clubRow.founded) : null,
    members: clubRow.members_count ?? clubRow.members ?? null,
    rating: typeof clubRow.rating === "number" ? clubRow.rating : null,
    totalReviews: typeof clubRow.total_reviews === "number" ? clubRow.total_reviews : null,
    status: clubRow.status ?? null,
    leagues: parseLeagues(clubRow.competition_level ?? clubRow.league ?? ""),
    description: clubRow.about ?? clubRow.description ?? null,
    stats: {
      facilities: statsValue("facilities"),
      coaching: statsValue("coaching"),
      community: statsValue("community"),
      value: statsValue("value"),
    },
    contactEmail: clubRow.contact_email ?? clubRow.admin_email ?? clubRow.email ?? null,
    contactPhone: clubRow.contact_phone ?? clubRow.admin_phone ?? clubRow.phone ?? null,
  }

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, content, inserted_at, user_id")
    .eq("club_id", id)
    .eq("is_flagged", false)
    .order("inserted_at", { ascending: false })
    .limit(10)

  const reviews: ClubReview[] = (reviewRows || []).map((row: any) => ({
    id: row.id,
    author: row.user_id ?? "Anonymous",
    rating: typeof row.rating === "number" ? row.rating : Number(row.rating) || 0,
    date: row.inserted_at ? new Date(row.inserted_at).toLocaleDateString() : "",
    content: row.content ?? "",
  }))

  const { data: discussionRows } = await supabase
    .from("discussions")
    .select("id, title, inserted_at, user_id, reply_count")
    .eq("club_id", id)
    .eq("is_flagged", false)
    .order("inserted_at", { ascending: false })
    .limit(10)

  const discussions: ClubDiscussion[] = (discussionRows || []).map((row: any) => ({
    id: row.id,
    title: row.title ?? "Untitled discussion",
    author: row.user_id ?? "Anonymous",
    replies: typeof row.reply_count === "number" ? row.reply_count : 0,
    lastActivity: row.inserted_at ? new Date(row.inserted_at).toLocaleString() : "",
  }))

  const contactCard = clubProfile.contactEmail || clubProfile.contactPhone ? (
    <Card>
      <CardHeader>
        <CardTitle>Contact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {clubProfile.contactEmail ? (
          <p className="text-sm">
            <a href={`mailto:${clubProfile.contactEmail}`} className="text-foreground hover:underline">
              {clubProfile.contactEmail}
            </a>
          </p>
        ) : null}
        {clubProfile.contactPhone ? <p className="text-sm text-foreground">{clubProfile.contactPhone}</p> : null}
      </CardContent>
    </Card>
  ) : null

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <ClubProfileView
        backHref="/users/dashboard"
        club={clubProfile}
        verified={clubProfile.status === "verified"}
        reviews={reviews}
        discussions={discussions}
        extraAsideSections={contactCard ?? undefined}
      />
    </div>
  )
}
