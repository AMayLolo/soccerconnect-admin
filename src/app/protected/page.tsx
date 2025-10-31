import type React from "react"
export const dynamic = "force-dynamic"
export const revalidate = 0

import { Navbar } from "@/components/Navbar"
import { ArrowRight, BarChart3, CheckCircle, Flag, Star, User, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your SoccerConnect platform</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
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
          />
          <DashboardCard
            title="Approvals"
            description="Approve or deny club updates and moderation changes."
            icon={<CheckCircle className="h-6 w-6" />}
            href="/protected/approvals"
            color="green"
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

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8">
          <p className="text-center text-xs text-muted-foreground">
            © 2025 SoccerConnect ·{" "}
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </p>
        </div>
      </footer>
    </main>
  )
}

function DashboardCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: "blue" | "red" | "green" | "yellow" | "purple" | "cyan"
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500/20",
    green: "bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500/20",
  }

  const arrowColorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
  }

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-border/80"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 ${colorClasses[color]}`}
          >
            {icon}
          </div>
          <div
            className={`opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${arrowColorClasses[color]}`}
          >
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  )
}
