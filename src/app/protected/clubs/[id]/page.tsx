import { createServerClient } from '@supabase/ssr'
import { ArrowLeft, Calendar, Flag, MapPin, MessageSquare, MoreVertical, Shield, Star, ThumbsUp, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatRow } from '@/components/ui/stat'
import { isSuperAdminEmail } from '@/constants/admins'
import { getCurrentUser } from '@/utils/auth'
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

  const club = {
    id: clubRow.id,
    name: clubRow.club_name ?? clubRow.name,
    logo: clubRow.logo_url ?? clubRow.logo,
    league: clubRow.competition_level ?? clubRow.league,
    location: [clubRow.city, clubRow.state].filter(Boolean).join(', ') || clubRow.location,
    founded: clubRow.founded ?? '',
    members: clubRow.members_count ?? clubRow.members ?? '—',
    rating: clubRow.rating ?? 0,
    totalReviews: clubRow.total_reviews ?? 0,
    status: clubRow.status ?? 'unverified',
    description: clubRow.about ?? clubRow.description ?? '',
    stats: clubRow.stats ?? { facilities: 0, coaching: 0, community: 0, value: 0 },
  }

  const { data: reviewsRows } = await supabase
    .from('reviews')
    .select('id, rating, content, inserted_at, helpful, is_flagged, user_id')
    .eq('club_id', id)
    .order('inserted_at', { ascending: false })
    .limit(10)

  const reviews = (reviewsRows || []).map((r: any) => ({
    id: r.id,
    author: r.user_id ?? 'Anonymous',
    authorAvatar: null,
    rating: r.rating ?? 0,
    date: r.inserted_at ? new Date(r.inserted_at).toLocaleDateString() : '',
    content: r.content,
    helpful: r.helpful ?? 0,
    flagged: r.is_flagged ?? false,
  }))

  const { data: discussionsRows } = await supabase
    .from('discussions')
    .select('id, title, inserted_at, user_id, is_flagged')
    .eq('club_id', id)
    .order('inserted_at', { ascending: false })
    .limit(10)

  const discussions = (discussionsRows || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    author: d.user_id ?? 'Anonymous',
    replies: 0,
    lastActivity: d.inserted_at ? new Date(d.inserted_at).toLocaleString() : '',
    flagged: d.is_flagged ?? false,
  }))

  return (
    <>
      {/* Header with breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
          <Link
            href="/protected/clubs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clubs
          </Link>
        </div>
      </div>

      {/* Club Header */}
  <div className="border-b border-border bg-linear-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-6">
              <Avatar className="h-24 w-24 rounded-xl border-2 border-border shadow-lg">
                {club.logo ? (
                  <AvatarImage src={club.logo} alt={club.name} className="rounded-xl" />
                ) : (
                  <AvatarFallback className="text-2xl">{club.name.substring(0, 2)}</AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground wrap-break-word text-wrap">{club.name}</h1>
                  {club.status === 'verified' && (
                    <Badge className="gap-1">
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {club.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Founded {club.founded}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {club.members} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(club.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{club.rating}</span>
                  <span className="text-sm text-muted-foreground">({club.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/protected/clubs/${club.id}/update`}>
                <Button variant="outline" size="sm">Edit Details</Button>
              </Link>
              <ClubActionMenu clubId={club.id} canDelete={canDelete} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Stats and Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Facilities" value={club.stats.facilities} />
                <StatRow label="Coaching" value={club.stats.coaching} />
                <StatRow label="Community" value={club.stats.community} />
                <StatRow label="Value" value={club.stats.value} />
              </CardContent>
            </Card>

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
          </div>

          {/* Right Column - Overview / Reviews / Discussions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-wrap">About <span className="block text-wrap">{club.name}</span></CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground text-wrap">{club.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{club.members}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{club.totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{club.rating}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{club.league}</p>
                    <p className="text-sm text-muted-foreground">League</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            {review.authorAvatar ? (
                              <AvatarImage src={review.authorAvatar} alt={review.author} />
                            ) : (
                              <AvatarFallback>{String(review.author).substring(0, 2)}</AvatarFallback>
                            )}
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{review.author}</p>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                                ))}
                              </div>
                              {review.flagged && (
                                <Badge variant="destructive" className="gap-1">
                                  <Flag className="h-3 w-3" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">{review.content}</p>
                            <div className="mt-3 flex items-center gap-4">
                              <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                                <ThumbsUp className="h-3 w-3" />
                                {review.helpful} helpful
                              </button>
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">Reply</Button>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discussion Threads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discussions.map((d) => (
                    <div key={d.id} className="rounded-lg border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.replies} replies • {d.lastActivity}</p>
                        </div>
                        {d.flagged && <Badge variant="destructive">Flagged</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
