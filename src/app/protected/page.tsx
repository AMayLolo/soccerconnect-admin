import type React from "react"
export const dynamic = "force-dynamic"
export const revalidate = 0

import { ArrowRight, BarChart3, CheckCircle, Flag, Star, User, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6">
            <div>
          
              <p className="mt-2 text-muted-foreground">Here's what's happening with your platform today.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Clubs" value="1,284" change="+12.5%" trend="up" />
              <StatCard label="Pending Approvals" value="23" change="+4" trend="up" />
              <StatCard label="Flagged Reports" value="8" change="-2" trend="down" />
              <StatCard label="Active Reviews" value="456" change="+18.2%" trend="up" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Access key admin functions and management tools</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Clubs"
            description="Manage club profiles, update details, and verify league info."
            icon={<Users className="h-6 w-6" />}
            href="/protected/clubs"
            color="blue"
          />
          <DashboardCard
            title="Flagged Reports"
            description="Review and resolve reported reviews or content."
            icon={<Flag className="h-6 w-6" />}
            href="/protected/flagged"
            color="red"
            badge="8"
          />
          <DashboardCard
            title="Approvals"
            description="Approve or deny club updates and moderation changes."
            icon={<CheckCircle className="h-6 w-6" />}
            href="/protected/approvals"
            color="green"
            badge="23"
          />
          <DashboardCard
            title="Reviews"
            description="Moderate user reviews and feedback from across clubs."
            icon={<Star className="h-6 w-6" />}
            href="/protected/reviews"
            color="yellow"
          />
          <DashboardCard
            title="Profile"
            description="Manage your admin account and update personal details."
            icon={<User className="h-6 w-6" />}
            href="/protected/profile"
            color="purple"
          />
          <DashboardCard
            title="Status"
            description="View recent updates, flagged reports, and system status."
            icon={<BarChart3 className="h-6 w-6" />}
            href="/protected/status"
            color="cyan"
          />
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

function StatCard({
  label,
  value,
  change,
  trend,
}: {
  label: string
  value: string
  change: string
  trend: "up" | "down"
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <TrendingUp
          className={`h-4 w-4 ${
            trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400 rotate-180"
          }`}
        />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <span
          className={`text-sm font-medium ${
            trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  )
}

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
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeColorClasses[color]}`}
              >
                {badge}
              </span>
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
