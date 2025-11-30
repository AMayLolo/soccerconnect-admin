import type React from "react"
export const dynamic = "force-dynamic"
export const revalidate = 0

import DashboardStatsShell from "@/components/DashboardStatsShell"
import StatsProvider from "@/components/StatsProvider"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerAdmin } from "@/lib/supabaseServerAdmin"
import { isClubProfileComplete } from "@/utils/clubProfileCompletion"
import normalizeStatsKey from "@/utils/normalizeStatsKey"
import { createServerClient } from "@supabase/ssr"
import { ArrowRight } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function DashboardPage() {
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

  // Admin client may be unavailable in some environments (missing service key)
  let adminSupabase: ReturnType<typeof getSupabaseServerAdmin> | null = null
  try {
    adminSupabase = getSupabaseServerAdmin()
  } catch (e) {
    console.warn("Admin Supabase unavailable — recent activity will be empty.", e)
    adminSupabase = null
  }

  // Server-side initial counts
  const [
    { count: clubsCount },
    { count: pendingCount },
    { count: reportsCount },
    { count: reviewsCount },
    { data: allClubs },
    { data: recentClubs }
  ] = await Promise.all([
    supabase.from("clubs").select("id", { head: true, count: "exact" }),
    supabase.from("profiles").select("id", { head: true, count: "exact" }).eq("status", "pending_review"),
    supabase.from("reports").select("id", { head: true, count: "exact" }),
    supabase.from("reviews").select("id", { head: true, count: "exact" }).eq("is_removed", false),
    supabase.from("clubs").select("*"),
    supabase.from("clubs").select("id, club_name, updated_at").order("updated_at", { ascending: false }).limit(10)
  ])

  // Optional admin-only recent activity
  let recentReviews: any[] = []
  let recentDiscussions: any[] = []
  if (adminSupabase) {
    try {
      const [reviewsRes, discussionsRes] = await Promise.all([
        adminSupabase
          .from("reviews")
          .select(`
            id,
            rating,
            inserted_at,
            club_id,
            clubs:club_id (club_name)
          `)
          .order("inserted_at", { ascending: false })
          .limit(10),
        adminSupabase
          .from("discussions")
          .select(`
            id,
            inserted_at,
            club_id,
            clubs:club_id (club_name)
          `)
          .order("inserted_at", { ascending: false })
          .limit(10)
      ])
      recentReviews = reviewsRes.data ?? []
      recentDiscussions = discussionsRes.data ?? []
    } catch (e) {
      console.warn("Admin queries failed — continuing without recent activity.", e)
    }
  }

  const totalClubs = clubsCount ?? 0
  const pendingApprovals = pendingCount ?? 0
  const flaggedReports = reportsCount ?? 0
  const activeReviews = reviewsCount ?? 0

  // Calculate complete vs incomplete clubs
  const completeClubs = allClubs?.filter(club => isClubProfileComplete(club)).length ?? 0
  const incompleteClubs = totalClubs - completeClubs

  const initialMap: Record<string, number> = {}
  initialMap[normalizeStatsKey("clubs")] = totalClubs
  initialMap[normalizeStatsKey("profiles", [{ column: "status", op: "eq", value: "pending_review" }])] = pendingApprovals
  initialMap[normalizeStatsKey("reports")] = flaggedReports
  initialMap[normalizeStatsKey("reviews", [{ column: "is_removed", op: "eq", value: false }])] = activeReviews

  return (
    <>
      <StatsProvider initial={initialMap}>
        <DashboardStatsShell
          totalClubs={totalClubs}
          completeClubs={completeClubs}
          incompleteClubs={incompleteClubs}
          pendingApprovals={pendingApprovals}
          flaggedReports={flaggedReports}
          activeReviews={activeReviews}
        />
      </StatsProvider>

      {/* Recent Activity Section */}
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reviews */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              Latest Reviews
            </h3>
            <div className="space-y-3">
              {recentReviews && recentReviews.length > 0 ? (
                recentReviews.slice(0, 5).map((review: any) => (
                  <Link
                    key={review.id}
                    href={`/protected/clubs/${review.club_id}/reviews`}
                    className="block text-sm hover:bg-gray-50 p-2 rounded transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {review.clubs?.club_name || 'Unknown Club'}
                      </span>
                      {review.rating && (
                        <span className="text-yellow-500 text-xs">{review.rating}★</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.inserted_at).toLocaleString()}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No recent reviews</p>
              )}
            </div>
            <Link
              href="/protected/reviews"
              className="mt-4 text-sm text-[#0d7a9b] hover:underline block"
            >
              View all reviews →
            </Link>
          </div>

          {/* Recent Discussions */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span>💬</span>
              Latest Discussions
            </h3>
            <div className="space-y-3">
              {recentDiscussions && recentDiscussions.length > 0 ? (
                recentDiscussions.slice(0, 5).map((discussion: any) => (
                  <Link
                    key={discussion.id}
                    href={`/protected/clubs/${discussion.club_id}/reviews`}
                    className="block text-sm hover:bg-gray-50 p-2 rounded transition"
                  >
                    <div className="font-medium text-gray-900 truncate mb-1">
                      {discussion.clubs?.club_name || 'Unknown Club'}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(discussion.inserted_at).toLocaleString()}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No recent discussions</p>
              )}
            </div>
            <Link
              href="/protected/discussions"
              className="mt-4 text-sm text-[#0d7a9b] hover:underline block"
            >
              View all discussions →
            </Link>
          </div>

          {/* Recently Updated Clubs */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span>🏟️</span>
              Recently Updated Clubs
            </h3>
            <div className="space-y-3">
              {recentClubs && recentClubs.length > 0 ? (
                recentClubs.slice(0, 5).map((club: any) => (
                  <Link
                    key={club.id}
                    href={`/protected/clubs/${club.id}`}
                    className="block text-sm hover:bg-gray-50 p-2 rounded transition"
                  >
                    <div className="font-medium text-gray-900 truncate mb-1">
                      {club.club_name}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(club.updated_at).toLocaleString()}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No recent updates</p>
              )}
            </div>
            <Link
              href="/protected/clubs"
              className="mt-4 text-sm text-[#0d7a9b] hover:underline block"
            >
              View all clubs →
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">© 2025 SoccerConnect. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

// StatCard removed — replaced by LiveStatCard (client) for live updates.

function DashboardCard({
  title,
  description,
  icon,
  href,
  color,
  badge,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: "blue" | "red" | "green" | "yellow" | "purple" | "cyan"
  badge?: string
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 group-hover:shadow-blue-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20 group-hover:shadow-red-500/20",
    green:
      "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20 group-hover:shadow-green-500/20",
    yellow:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20 group-hover:shadow-yellow-500/20",
    purple:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 group-hover:shadow-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20 group-hover:shadow-cyan-500/20",
  }

  const badgeColorClasses = {
    blue: "bg-blue-500/20 text-blue-700 dark:text-blue-300 ring-blue-500/30",
    red: "bg-red-500/20 text-red-700 dark:text-red-300 ring-red-500/30",
    green: "bg-green-500/20 text-green-700 dark:text-green-300 ring-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 ring-yellow-500/30",
    purple: "bg-purple-500/20 text-purple-700 dark:text-purple-300 ring-purple-500/30",
    cyan: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30",
  }

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110 ${colorClasses[color]}`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColorClasses[color]}`}>
                {badge}
              </Badge>
            )}
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  )
}
