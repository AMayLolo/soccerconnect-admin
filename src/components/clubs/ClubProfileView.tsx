import type { ReactNode } from "react"

import { ArrowLeft, Calendar, MapPin, Shield, Star, Users } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatRow } from "@/components/ui/stat"

export type ClubProfile = {
  id: string
  name: string
  logo: string | null
  location: string
  founded?: string | null
  members?: string | number | null
  rating?: number | null
  totalReviews?: number | null
  status?: string | null
  leagues: string[]
  description?: string | null
  stats?: {
    facilities?: number | null
    coaching?: number | null
    community?: number | null
    value?: number | null
  } | null
  contactEmail?: string | null
  contactPhone?: string | null
}

export type ClubReview = {
  id: string
  author: string
  rating: number
  date: string
  content: string
  helpful?: number
  flagged?: boolean
}

export type ClubDiscussion = {
  id: string
  title: string
  author: string
  replies: number
  lastActivity: string
  flagged?: boolean
}

export type ClaimInfo = {
  statusLabel: string
  adminStatusLabel: string | null
  claimedByUserId: string | null
  adminDetails: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

export type ClubProfileViewProps = {
  backHref: string
  club: ClubProfile
  verified?: boolean
  reviews: ClubReview[]
  discussions: ClubDiscussion[]
  headerActions?: ReactNode
  extraAsideSections?: ReactNode
  showClaimInfo?: boolean
  claimInfo?: ClaimInfo | null
  renderReviewActions?: (review: ClubReview) => ReactNode
  renderDiscussionActions?: (discussion: ClubDiscussion) => ReactNode
  renderLeagueBadge?: (league: string) => ReactNode
}

const safeStat = (value: number | string | null | undefined) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim().length > 0) {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
  }
  return 0
}

const renderStars = (rating: number | null | undefined) => {
  const value = typeof rating === "number" ? rating : 0
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.floor(value) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  )
}

const formatMembers = (members: string | number | null | undefined) => {
  if (typeof members === "number") return members.toLocaleString()
  if (typeof members === "string" && members.trim().length > 0) return members
  return "—"
}

const formatRating = (rating: number | null | undefined) => {
  if (typeof rating === "number" && Number.isFinite(rating)) return rating.toFixed(1)
  return "—"
}

export function ClubProfileView({
  backHref,
  club,
  verified = false,
  reviews,
  discussions,
  headerActions,
  extraAsideSections,
  showClaimInfo = false,
  claimInfo,
  renderReviewActions,
  renderDiscussionActions,
  renderLeagueBadge,
}: ClubProfileViewProps) {
  const stats = {
    facilities: safeStat(club.stats?.facilities ?? null),
    coaching: safeStat(club.stats?.coaching ?? null),
    community: safeStat(club.stats?.community ?? null),
    value: safeStat(club.stats?.value ?? null),
  }

  const formattedRating = formatRating(club.rating ?? null)
  const totalReviews = typeof club.totalReviews === "number" ? club.totalReviews : 0

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clubs
          </Link>
        </div>
      </div>

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

              <div className="min-w-0 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground wrap-break-word text-wrap">
                    {club.name}
                  </h1>
                  {verified && (
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
                  {club.founded ? (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Founded {club.founded}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {formatMembers(club.members)} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {renderStars(club.rating ?? null)}
                  <span className="text-sm font-medium text-foreground">{formattedRating}</span>
                  <span className="text-sm text-muted-foreground">({totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {headerActions ? <div className="flex gap-2">{headerActions}</div> : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Club Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Facilities" value={stats.facilities} />
                <StatRow label="Coaching" value={stats.coaching} />
                <StatRow label="Community" value={stats.community} />
                <StatRow label="Value" value={stats.value} />
              </CardContent>
            </Card>

            {showClaimInfo && claimInfo ? (
              <Card>
                <CardHeader>
                  <CardTitle>Club Administration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Claim Status</p>
                    <p className="text-sm font-medium text-foreground">{claimInfo.statusLabel}</p>
                  </div>

                  {claimInfo.adminDetails ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin Name</p>
                        <p className="text-sm text-foreground">{claimInfo.adminDetails.name ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin Email</p>
                        {claimInfo.adminDetails.email ? (
                          <p className="text-sm text-foreground break-all">
                            <a href={`mailto:${claimInfo.adminDetails.email}`} className="hover:underline">
                              {claimInfo.adminDetails.email}
                            </a>
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin Phone</p>
                        <p className="text-sm text-foreground">{claimInfo.adminDetails.phone ?? "—"}</p>
                      </div>
                      {claimInfo.adminStatusLabel ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile Status</p>
                          <p className="text-sm text-foreground">{claimInfo.adminStatusLabel}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Claim has been approved, but the admin profile details are not available.
                    </p>
                  )}

                  {claimInfo.claimedByUserId ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin User ID</p>
                      <p className="text-xs text-muted-foreground break-all">{claimInfo.claimedByUserId}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No admin has claimed this club yet.</p>
                  )}

                  {(club.contactEmail || club.contactPhone) && (
                    <div className="space-y-2 border-t border-border/60 pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Club Contact</p>
                      {club.contactEmail ? (
                        <p className="text-sm text-foreground break-all">
                          <a href={`mailto:${club.contactEmail}`} className="hover:underline">
                            {club.contactEmail}
                          </a>
                        </p>
                      ) : null}
                      {club.contactPhone ? <p className="text-sm text-foreground">{club.contactPhone}</p> : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {extraAsideSections}
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-wrap">
                  About <span className="block text-wrap">{club.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground text-wrap">
                  {club.description ?? "We\'re gathering more details about this club."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{formatMembers(club.members)}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-2xl font-bold text-foreground">{formattedRating}</p>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Leagues</p>
                    {club.leagues.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {club.leagues.map((league) => (
                          <span key={league} className="inline-flex">
                            {renderLeagueBadge ? renderLeagueBadge(league) : <Badge variant="secondary">{league}</Badge>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-2xl font-bold text-foreground">—</p>
                    )}
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
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      There are no reviews for this club yet. Be the first to share your experience.
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{review.author}</p>
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                                <span className="text-sm font-medium text-foreground">{review.rating.toFixed(1)}</span>
                              </div>
                              {review.flagged ? (
                                <Badge variant="destructive" className="text-xs uppercase tracking-wide">
                                  Flagged
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                          {typeof review.helpful === "number" ? (
                            <p className="text-xs text-muted-foreground">{review.helpful} found this helpful</p>
                          ) : null}
                          {renderReviewActions ? (
                            <div className="pt-2">{renderReviewActions(review)}</div>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                {discussions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No discussions yet. Start the first conversation about this club.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div key={discussion.id} className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{discussion.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Started by {discussion.author} · {discussion.lastActivity}
                              </p>
                            </div>
                            {discussion.flagged ? (
                              <Badge variant="destructive" className="text-xs uppercase tracking-wide">
                                Flagged
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground">{discussion.replies} replies</p>
                          {renderDiscussionActions ? (
                            <div className="pt-2">{renderDiscussionActions(discussion)}</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClubProfileView
