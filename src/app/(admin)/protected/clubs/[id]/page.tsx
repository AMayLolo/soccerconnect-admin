import { createServerClient } from '@supabase/ssr'
import { Flag, MessageSquare, MoreVertical, ThumbsUp, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import ClubProfileView, {
    type ClaimInfo,
    type ClubDiscussion,
    type ClubProfile,
    type ClubReview,
} from '@/components/clubs/ClubProfileView'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isSuperAdminEmail } from '@/constants/admins'
import { getSupabaseServerAdmin } from '@/lib/supabaseServerAdmin'
import { getCurrentUser } from '@/utils/auth'
import parseLeagues from '@/utils/parseLeagues'
import { ClubActionMenu } from './ClubActionMenu'

export const revalidate = 0

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {},
      },
    }
  )

  const { data: clubRow, error: clubErr } = await supabase.from('clubs').select('*').eq('id', id).maybeSingle()
  if (clubErr) console.error('Failed to load club:', clubErr)
  if (!clubRow) return notFound()

  const currentUser = await getCurrentUser()
  const canDelete = isSuperAdminEmail(currentUser?.email)

  const claimStatus = clubRow.claim_status ?? 'unclaimed'
  const claimedByUserId = clubRow.claimed_by_user_id ?? null
  const contactName = clubRow.contact_name ?? null
  const contactEmail = clubRow.contact_email ?? clubRow.admin_email ?? clubRow.email ?? null
  const contactPhone = clubRow.contact_phone ?? clubRow.admin_phone ?? clubRow.phone ?? null

  const rawStats = (clubRow.stats ?? {}) as Record<string, number | string | null | undefined>

  const toNullableNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim().length > 0) {
      const numeric = Number(value)
      if (Number.isFinite(numeric)) return numeric
    }
    return null
  }

  const statsValue = (key: 'facilities' | 'coaching' | 'community' | 'value') =>
    toNullableNumber(rawStats[key]) ?? toNullableNumber((clubRow as Record<string, unknown>)[`${key}_rating`])

  const leagues = parseLeagues(clubRow.competition_level ?? clubRow.league ?? '')

  const clubProfile: ClubProfile = {
    id: clubRow.id,
    name: clubRow.club_name ?? clubRow.name ?? 'Untitled Club',
    logo: clubRow.logo_url ?? clubRow.logo ?? null,
    location: [clubRow.city, clubRow.state].filter(Boolean).join(', ') || clubRow.location || 'Location unavailable',
    founded: clubRow.founded ? String(clubRow.founded) : null,
    members: clubRow.members_count ?? clubRow.members ?? null,
    rating: typeof clubRow.rating === 'number' ? clubRow.rating : null,
    totalReviews: typeof clubRow.total_reviews === 'number' ? clubRow.total_reviews : null,
    status: clubRow.status ?? null,
    leagues,
    description: clubRow.about ?? clubRow.description ?? null,
    stats: {
      facilities: statsValue('facilities'),
      coaching: statsValue('coaching'),
      community: statsValue('community'),
      value: statsValue('value'),
    },
    contactEmail,
    contactPhone,
  }

  const formatStatusLabel = (value: string) =>
    value
      .split(/[_\s]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')

  let clubAdminDetails: {
    name: string | null
    email: string | null
    phone: string | null
    status: string | null
  } | null = null

  if (claimedByUserId) {
    try {
      const adminClient = getSupabaseServerAdmin()
      const [{ data: profileData, error: profileError }, userResult] = await Promise.all([
        adminClient
          .from('profiles')
          .select('full_name, display_name, phone, phone_number, status')
          .eq('user_id', claimedByUserId)
          .maybeSingle(),
        adminClient.auth.admin.getUserById(claimedByUserId),
      ])

      if (profileError) {
        console.error('Failed to load claimed admin profile', profileError)
      }
      if (userResult.error) {
        console.error('Failed to load claimed admin auth user', userResult.error)
      }

      const profileRecord = (profileData ?? null) as Record<string, unknown> | null
      const authUser = userResult.data?.user ?? null

      const profileName =
        (profileRecord?.['full_name'] as string | undefined) ??
        (profileRecord?.['display_name'] as string | undefined) ??
        contactName ??
        null

      const profilePhone =
        (profileRecord?.['phone'] as string | undefined) ??
        (profileRecord?.['phone_number'] as string | undefined) ??
        contactPhone ??
        null

      clubAdminDetails = {
        name: profileName ?? authUser?.email ?? null,
        email: authUser?.email ?? contactEmail ?? null,
        phone: profilePhone,
        status: (profileRecord?.['status'] as string | undefined) ?? null,
      }
    } catch (error) {
      console.error('Unable to resolve claimed admin details', error)
    }
  }

  const humanClaimStatus = formatStatusLabel(claimStatus)
  const humanAdminStatus = clubAdminDetails?.status ? formatStatusLabel(clubAdminDetails.status) : null

  const { data: reviewsRows } = await supabase
    .from('reviews')
    .select('id, rating, content, inserted_at, helpful, is_flagged, user_id')
    .eq('club_id', id)
    .order('inserted_at', { ascending: false })
    .limit(10)

  const reviews: ClubReview[] = (reviewsRows || []).map((r: any) => ({
    id: r.id,
    author: r.user_id ?? 'Anonymous',
    rating: typeof r.rating === 'number' ? r.rating : Number(r.rating) || 0,
    date: r.inserted_at ? new Date(r.inserted_at).toLocaleDateString() : '',
    content: r.content ?? '',
    helpful: typeof r.helpful === 'number' ? r.helpful : null,
    flagged: Boolean(r.is_flagged),
  }))

  const { data: discussionsRows } = await supabase
    .from('discussions')
    .select('id, title, inserted_at, user_id, is_flagged, reply_count')
    .eq('club_id', id)
    .order('inserted_at', { ascending: false })
    .limit(10)

  const discussions: ClubDiscussion[] = (discussionsRows || []).map((d: any) => ({
    id: d.id,
    title: d.title ?? 'Untitled discussion',
    author: d.user_id ?? 'Anonymous',
    replies: typeof d.reply_count === 'number' ? d.reply_count : 0,
    lastActivity: d.inserted_at ? new Date(d.inserted_at).toLocaleString() : '',
    flagged: Boolean(d.is_flagged),
  }))

  const claimInfo: ClaimInfo = {
    statusLabel: humanClaimStatus,
    adminStatusLabel: humanAdminStatus,
    claimedByUserId,
    adminDetails: clubAdminDetails
      ? {
          name: clubAdminDetails.name,
          email: clubAdminDetails.email,
          phone: clubAdminDetails.phone,
        }
      : null,
  }

  const headerActions = (
    <div className="flex gap-2">
      <Link href={`/protected/clubs/${clubProfile.id}/update`}>
        <Button variant="outline" size="sm">
          Edit Details
        </Button>
      </Link>
      <ClubActionMenu clubId={clubProfile.id} canDelete={canDelete} />
    </div>
  )

  const quickActionsCard = (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
          <Flag className="h-4 w-4" />
          View Flagged Content
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
          <MessageSquare className="h-4 w-4" />
          Moderate Discussions
        </Button>
        <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
          <Users className="h-4 w-4" />
          Manage Members
        </Button>
      </CardContent>
    </Card>
  )

  const renderLeagueBadge = (league: string) => (
    <Link key={league} href={`/protected/clubs?league=${encodeURIComponent(league)}`} className="inline-flex">
      <Badge variant="secondary" className="cursor-pointer">
        {league}
      </Badge>
    </Link>
  )

  const renderReviewActions = (_review: ClubReview) => (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
      <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <ThumbsUp className="h-3 w-3" />
        Mark helpful
      </button>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-auto px-0 text-xs">
          Reply
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <ClubProfileView
      backHref="/protected/clubs"
      club={clubProfile}
      verified={clubProfile.status === 'verified'}
      reviews={reviews}
      discussions={discussions}
      headerActions={headerActions}
      extraAsideSections={quickActionsCard}
      showClaimInfo
      claimInfo={claimInfo}
      renderReviewActions={renderReviewActions}
      renderLeagueBadge={renderLeagueBadge}
    />
  )
}
