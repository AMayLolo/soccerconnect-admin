"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchDashboardSnapshot } from "./snapshot"
import type { DashboardSnapshot, NotificationPreferences } from "./types"

type DashboardClientProps = {
  initialData: DashboardSnapshot
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  notifyWatchlistReviews: false,
  notifyMyClubReviews: false,
}

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`
const formatRating = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) return null
  return value.toFixed(1)
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const supabase = getSupabaseBrowserClient()

  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(initialData)
  const [refreshing, setRefreshing] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationSaving, setNotificationSaving] = useState(false)

  useEffect(() => {
    setSnapshot(initialData)
  }, [initialData])

  const loadDashboard = useCallback(async () => {
    setRefreshing(true)
    try {
      const next = await fetchDashboardSnapshot(supabase)
      setSnapshot(next)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to refresh dashboard."
      setSnapshot((prev) => ({
        ...prev,
        alerts: [...prev.alerts, message],
      }))
    } finally {
      setRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      loadDashboard()
    })

    return () => {
      data?.subscription.unsubscribe()
    }
  }, [loadDashboard, supabase])

  const myClub = useMemo(() => {
    const clubId = snapshot.profile?.clubId
    if (!clubId) return null
    return snapshot.clubs[clubId] ?? null
  }, [snapshot.clubs, snapshot.profile?.clubId])

  const watchlistClubs = useMemo(() => {
    return snapshot.watchlistClubIds
      .map((id) => snapshot.clubs[id])
      .filter((club): club is DashboardSnapshot["clubs"][string] => Boolean(club))
  }, [snapshot.clubs, snapshot.watchlistClubIds])

  const handlePreferenceChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (!snapshot.isAuthenticated || !snapshot.userId) {
      setNotificationMessage("Sign in to manage notification preferences.")
      return
    }

    if (!snapshot.supportsNotificationPrefs) {
      setNotificationMessage("Notifications are not available for this account.")
      return
    }

    setNotificationSaving(true)
    setNotificationMessage("")

    setSnapshot((prev) => ({
      ...prev,
      notificationPrefs: {
        ...(prev.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS),
        [key]: value,
      },
    }))

    const column =
      key === "notifyWatchlistReviews"
        ? "notify_watchlist_reviews"
        : "notify_my_club_reviews"

    const { error } = await supabase
      .from("profiles")
      .update({ [column]: value })
      .eq("user_id", snapshot.userId)

    if (error) {
      setNotificationMessage(error.message ?? "Unable to update preferences right now.")
      setSnapshot((prev) => ({
        ...prev,
        notificationPrefs: {
          ...(prev.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS),
          [key]: !value,
        },
      }))
    } else {
      setNotificationMessage("Notification preferences updated.")
    }

    setNotificationSaving(false)
  }

  const renderReviewList = (clubId: string) => {
    const reviews = snapshot.reviews[clubId] ?? []
    const totalCount = snapshot.reviewCounts[clubId] ?? reviews.length

    if (totalCount === 0) {
      return <p className="text-sm text-muted-foreground">No reviews yet.</p>
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{pluralize(reviews.length, "recent review")}</span>
          <Badge variant="secondary">{pluralize(totalCount, "total review")}</Badge>
        </div>
        <ul className="space-y-3">
          {reviews.map((review) => {
            const timestamp = formatDistanceToNow(new Date(review.inserted_at), {
              addSuffix: true,
            })

            return (
              <li key={review.id} className="rounded-md border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>{review.rating ? `Rating ${review.rating}/5` : "Review"}</span>
                  <span>{timestamp}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {review.content || "No review text provided."}
                </p>
              </li>
            )
          })}
        </ul>
        {totalCount > reviews.length ? (
          <p className="text-xs text-muted-foreground">
            Showing {reviews.length} of {totalCount} reviews. Visit the club page for the full list.
          </p>
        ) : null}
      </div>
    )
  }

  if (!snapshot.isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to SoccerConnect</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to view your personalized dashboard, watchlist, and club updates.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    )
  }

  const alerts = snapshot.alerts
  const notificationPrefs = snapshot.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS
  const headerName = snapshot.profile?.displayName ?? snapshot.userEmail ?? "friend"

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {refreshing ? "Refreshing your dashboard..." : `Welcome back, ${headerName}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track activity for your club and watchlist without leaving the community.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboard} disabled={refreshing}>
          {refreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={`${alert}-${index}`}
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {alert}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>My Club</CardTitle>
              {myClub ? (
                <p className="text-xs text-muted-foreground">
                  {(() => {
                    const ratingText = formatRating(myClub.rating)
                    const reviewCount = snapshot.reviewCounts[myClub.id] ?? 0

                    if (ratingText && reviewCount > 0) {
                      return `Rating ${ratingText}/5 · ${pluralize(reviewCount, "review")}`
                    }

                    if (ratingText) {
                      return `Rating ${ratingText}/5`
                    }

                    if (reviewCount > 0) {
                      return pluralize(reviewCount, "review")
                    }

                    return "Rating unavailable"
                  })()}
                </p>
              ) : null}
            </div>
            {myClub ? (
              <Button asChild variant="link" size="sm">
                <Link href={`/clubs/${myClub.id}`}>Open club page</Link>
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {myClub ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">{myClub.club_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[myClub.city, myClub.state].filter(Boolean).join(", ") || "Location coming soon"}
                  </p>
                  {myClub.competition_level ? (
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {myClub.competition_level}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-semibold">Latest reviews</h3>
                  <div className="mt-3">{renderReviewList(myClub.id)}</div>
                </div>

                <Button asChild variant="secondary" size="sm">
                  <Link href="/users">Manage profile</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You have not connected a club yet. Update your profile to let us know where you belong.
                </p>
                <Button asChild size="sm">
                  <Link href="/users">Update profile</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Club Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            {!snapshot.watchlistAvailable ? (
              <p className="text-sm text-muted-foreground">
                Watchlists are temporarily unavailable. Please check back later.
              </p>
            ) : watchlistClubs.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  No clubs on your watchlist yet. Add clubs from your profile to track their activity here.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/users">Add clubs</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {watchlistClubs.map((club) => (
                  <div key={club.id} className="rounded-md border p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{club.club_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {[club.city, club.state].filter(Boolean).join(", ") || "Location coming soon"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {pluralize(snapshot.reviewCounts[club.id] ?? 0, "review")}
                      </Badge>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                        Recent reviews
                      </h4>
                      <div className="mt-2">{renderReviewList(club.id)}</div>
                    </div>
                    <div className="mt-4 text-right">
                      <Button asChild variant="link" size="sm">
                        <Link href={`/clubs/${club.id}`}>Open club page</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!snapshot.supportsNotificationPrefs ? (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Notification preferences are not available for this account yet.</p>
                <p className="text-xs">We&apos;re rolling out email alerts soon. Thanks for your patience!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.notifyMyClubReviews}
                    onChange={(event) =>
                      handlePreferenceChange("notifyMyClubReviews", event.target.checked)
                    }
                    disabled={notificationSaving}
                    className="size-4 accent-primary"
                  />
                  <span>Send me emails when new reviews are added for my club.</span>
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.notifyWatchlistReviews}
                    onChange={(event) =>
                      handlePreferenceChange("notifyWatchlistReviews", event.target.checked)
                    }
                    disabled={notificationSaving}
                    className="size-4 accent-primary"
                  />
                  <span>Alert me when clubs on my watchlist receive new reviews.</span>
                </label>
              </div>
            )}

            {notificationMessage ? (
              <p className="text-sm text-muted-foreground">{notificationMessage}</p>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Preferences update instantly and you can change them at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
