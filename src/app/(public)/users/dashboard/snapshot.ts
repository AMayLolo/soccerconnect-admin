import type { SupabaseClient } from "@supabase/supabase-js"
import {
    DashboardSnapshot,
    NotificationPreferences,
    ProfileInfo,
    isNonEmptyString,
    normalizeId,
} from "./types"

export async function fetchDashboardSnapshot(
  supabase: SupabaseClient<any, any, any>
): Promise<DashboardSnapshot> {
  const alerts: string[] = []

  const base: DashboardSnapshot = {
    isAuthenticated: false,
    userId: null,
    userEmail: null,
    alerts,
    profile: null,
    watchlistAvailable: true,
    watchlistClubIds: [],
    clubs: {},
    reviews: {},
    reviewCounts: {},
    supportsNotificationPrefs: true,
    notificationPrefs: null,
  }

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser()

  if (sessionError) {
    alerts.push(sessionError.message ?? "Unable to load your session.")
    return base
  }

  if (!user) {
    return base
  }

  let supportsNotificationPrefs = true
  let profileRow: Record<string, any> | null = null

  const optionalProfileColumns = [
    { key: "display_name" },
    { key: "full_name" },
    { key: "approved_role" },
    { key: "requested_role" },
    { key: "club_id" },
    {
      key: "notify_watchlist_reviews",
      onMissing: () => {
        supportsNotificationPrefs = false
      },
    },
    {
      key: "notify_my_club_reviews",
      onMissing: () => {
        supportsNotificationPrefs = false
      },
    },
  ] as const

  let requestedColumns: string[] = optionalProfileColumns.map((column) => column.key)
  let profileErrorMessage: string | null = null

  while (true) {
    const selection = requestedColumns.length > 0 ? requestedColumns.join(", ") : "user_id"
    const { data, error } = await supabase
      .from("profiles")
      .select(selection)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!error) {
      profileRow = data
      break
    }

    const message = error.message ?? ""
    let adjusted = false

    for (const column of optionalProfileColumns) {
      if (!requestedColumns.includes(column.key)) continue
      if (!message.includes(column.key)) continue

      requestedColumns = requestedColumns.filter((value) => value !== column.key)
      if ("onMissing" in column && typeof column.onMissing === "function") {
        column.onMissing()
      }
      adjusted = true
    }

    if (!adjusted) {
      profileErrorMessage = message
      profileRow = data
      break
    }

    if (requestedColumns.length === 0) {
      profileRow = data
      break
    }
  }

  if (profileErrorMessage) {
    alerts.push(profileErrorMessage || "Unable to load your profile right now.")
  }

  let notificationPrefs: NotificationPreferences | null = null
  let resolvedProfile: ProfileInfo | null = null

  if (profileRow) {
    const rawDisplay = isNonEmptyString(profileRow.display_name) ? profileRow.display_name : null
    const rawFull = isNonEmptyString(profileRow.full_name) ? profileRow.full_name : null
    const resolvedRole = isNonEmptyString(profileRow.approved_role)
      ? profileRow.approved_role
      : isNonEmptyString(profileRow.requested_role)
      ? profileRow.requested_role
      : null

    const siteAdmin = resolvedRole === "site_admin"
    const displayName = siteAdmin
      ? "Soccer Connect (Official)"
      : rawDisplay ?? rawFull ?? (user.email ?? "Your Dashboard")

    const clubId = !siteAdmin ? normalizeId(profileRow.club_id) : null

    resolvedProfile = {
      displayName,
      clubId,
      isClubAdmin: resolvedRole === "club_admin",
      role: resolvedRole,
    }

    if (supportsNotificationPrefs) {
      notificationPrefs = {
        notifyWatchlistReviews: Boolean(profileRow.notify_watchlist_reviews),
        notifyMyClubReviews: Boolean(profileRow.notify_my_club_reviews),
      }
    }
  } else {
    resolvedProfile = {
      displayName: user.email ?? "Your Dashboard",
      clubId: null,
      isClubAdmin: false,
      role: null,
    }
  }

  let watchlistAvailable = true
  let watchlistClubIds: string[] = []

  const { data: watchlistData, error: watchlistError } = await supabase
    .from("profile_club_watchlist")
    .select("club_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (watchlistError) {
    watchlistAvailable = false
  } else if (Array.isArray(watchlistData)) {
    watchlistClubIds = watchlistData
      .map((row: { club_id: unknown }) => normalizeId(row.club_id))
      .filter((value): value is string => typeof value === "string" && value.length > 0)
  }

  const targetClubIds = Array.from(
    new Set([
      ...(resolvedProfile?.clubId ? [resolvedProfile.clubId] : []),
      ...watchlistClubIds,
    ])
  )

  let clubs: DashboardSnapshot["clubs"] = {}
  if (targetClubIds.length > 0) {
    const baseColumns = "id, club_name, city, state, competition_level"
    const ratingColumn = "rating"
    let selectColumns = `${baseColumns}, ${ratingColumn}`
    let clubsError: Error | null = null
    let clubsData: any[] | null = null
    let attemptedWithoutRating = false

    while (true) {
      const { data, error } = await supabase
        .from("clubs")
        .select(selectColumns)
        .in("id", targetClubIds)

      if (!error) {
        clubsData = data ?? []
        break
      }

      const message = error.message ?? ""
      const ratingMissing = message.includes(ratingColumn)

      if (!attemptedWithoutRating && ratingMissing) {
        attemptedWithoutRating = true
        selectColumns = baseColumns
        continue
      }

      clubsError = error
      break
    }

    if (clubsError) {
      alerts.push("Unable to load club details right now.")
    } else if (Array.isArray(clubsData)) {
      clubs = clubsData.reduce<DashboardSnapshot["clubs"]>((acc, club) => {
        const normalizedId = normalizeId(club?.id)
        if (!normalizedId) return acc

        let rating: number | null = null
        if ("rating" in club) {
          const rawRating = (club as Record<string, unknown>).rating
          if (typeof rawRating === "number") {
            rating = Number.isNaN(rawRating) ? null : rawRating
          } else if (typeof rawRating === "string") {
            const parsed = Number.parseFloat(rawRating)
            rating = Number.isNaN(parsed) ? null : parsed
          }
        }

        acc[normalizedId] = {
          ...club,
          id: normalizedId,
          rating,
        }

        return acc
      }, {})
    }
  }

  let reviews: DashboardSnapshot["reviews"] = {}
  if (targetClubIds.length > 0) {
    const reviewLimit = Math.min(Math.max(targetClubIds.length * 3, 12), 60)
    const { data, error } = await supabase
      .from("reviews")
      .select("id, club_id, rating, content, inserted_at")
      .in("club_id", targetClubIds)
      .order("inserted_at", { ascending: false })
      .limit(reviewLimit)

    if (error) {
      console.warn("Unable to load recent reviews", error)
    } else if (Array.isArray(data)) {
      reviews = data.reduce<DashboardSnapshot["reviews"]>((acc, review) => {
        const clubId = normalizeId(review?.club_id)
        if (!clubId) return acc

        const entries = acc[clubId] ?? []
        if (entries.length < 3) {
          entries.push({
            ...review,
            club_id: clubId,
          })
          acc[clubId] = entries
        }

        return acc
      }, {})
    }
  }

  let reviewCounts: DashboardSnapshot["reviewCounts"] = {}
  if (targetClubIds.length > 0) {
    const countResults = await Promise.allSettled(
      targetClubIds.map(async (clubId) => {
        const { count, error } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("club_id", clubId)

        if (error) throw error
        return { clubId, count: count ?? 0 }
      })
    )

    let countErrored = false
    reviewCounts = countResults.reduce<DashboardSnapshot["reviewCounts"]>((acc, result) => {
      if (result.status === "fulfilled") {
        acc[result.value.clubId] = result.value.count
      } else {
        countErrored = true
      }
      return acc
    }, {})

    if (countErrored) {
      console.warn("Unable to compute review totals for some clubs", countResults)
    }
  }

  return {
    isAuthenticated: true,
    userId: user.id,
    userEmail: user.email ?? null,
    alerts,
    profile: resolvedProfile,
    watchlistAvailable,
    watchlistClubIds,
    clubs,
    reviews,
    reviewCounts,
    supportsNotificationPrefs,
    notificationPrefs,
  }
}
