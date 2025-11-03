export type ProfileInfo = {
  displayName: string
  clubId: string | null
  isClubAdmin: boolean
  role: string | null
}

export type ClubSummary = {
  id: string
  club_name: string
  city?: string | null
  state?: string | null
  competition_level?: string | null
  rating?: number | null
}

export type ReviewRow = {
  id: string
  club_id: string
  rating: number | null
  content: string
  inserted_at: string
}

export type NotificationPreferences = {
  notifyWatchlistReviews: boolean
  notifyMyClubReviews: boolean
}

export type DashboardSnapshot = {
  isAuthenticated: boolean
  userId: string | null
  userEmail: string | null
  alerts: string[]
  profile: ProfileInfo | null
  watchlistAvailable: boolean
  watchlistClubIds: string[]
  clubs: Record<string, ClubSummary>
  reviews: Record<string, ReviewRow[]>
  reviewCounts: Record<string, number>
  supportsNotificationPrefs: boolean
  notificationPrefs: NotificationPreferences | null
}

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

export const normalizeId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null
  }

  return null
}
