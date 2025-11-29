"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, CheckCircle, Flag, Star, User, Users } from "lucide-react"
import Link from "next/link"
import React from "react"
import LiveStatCard from "./LiveStatCard"

export default function DashboardStatsShell({
  totalClubs,
  completeClubs,
  incompleteClubs,
  pendingApprovals,
  flaggedReports,
  activeReviews,
}: {
  totalClubs: number
  completeClubs: number
  incompleteClubs: number
  pendingApprovals: number
  flaggedReports: number
  activeReviews: number
}) {
  return (
    <>
      <div className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
              <p className="mt-2 text-muted-foreground">Here's what's happening with your platform today.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LiveStatCard label="Total Clubs" table="clubs" initialCount={totalClubs} href="/protected/clubs" />
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">Club Profiles</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-600">{completeClubs}</span>
                      <span className="text-sm text-muted-foreground">complete</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-600">{incompleteClubs}</span>
                      <span className="text-sm text-muted-foreground">incomplete</span>
                    </div>
                  </div>
                </div>
              </div>
              <LiveStatCard label="Pending Approvals" table="profiles" initialCount={pendingApprovals} filters={[{ column: "status", op: "eq", value: "pending_review" }]} href="/protected/approvals" />
              <LiveStatCard label="Flagged Reports" table="reports" initialCount={flaggedReports} href="/protected/flagged" />
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
            badge={String(flaggedReports)}
          />
          <DashboardCard
            title="Approvals"
            description="Approve or deny club updates and moderation changes."
            icon={<CheckCircle className="h-6 w-6" />}
            href="/protected/approvals"
            color="green"
            badge={String(pendingApprovals)}
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
    </>
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
    green: "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20 group-hover:shadow-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20 group-hover:shadow-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20 group-hover:shadow-purple-500/20",
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
