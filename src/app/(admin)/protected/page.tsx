import type React from "react"
export const dynamic = "force-dynamic"
export const revalidate = 0

import DashboardStatsShell from "@/components/DashboardStatsShell"
import StatsProvider from "@/components/StatsProvider"
import { Badge } from "@/components/ui/badge"
import normalizeStatsKey from "@/utils/normalizeStatsKey"
import { isClubProfileComplete } from "@/utils/clubProfileCompletion"
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

  // Server-side initial counts
  const [
    { count: clubsCount }, 
    { count: pendingCount }, 
    { count: reportsCount }, 
    { count: reviewsCount },
    { data: allClubs }
  ] = await Promise.all([
    supabase.from("clubs").select("id", { head: true, count: "exact" }),
    supabase.from("profiles").select("id", { head: true, count: "exact" }).eq("status", "pending_review"),
    supabase.from("reports").select("id", { head: true, count: "exact" }),
    supabase.from("reviews").select("id", { head: true, count: "exact" }).eq("is_removed", false),
    supabase.from("clubs").select("*")
  ])

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

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  )
}
