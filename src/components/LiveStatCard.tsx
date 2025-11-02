"use client"

import Link from "next/link"
import { useSharedStats } from "./StatsProvider"

export default function LiveStatCard({
  label,
  table,
  initialCount = 0,
  filters,
  href,
}: {
  label: string
  table: string
  initialCount?: number
  filters?: Array<{ column: string; op: string; value: any }>
  href?: string
}) {
  const { count, loading } = useSharedStats(table, filters, initialCount as number | undefined)

  const content = (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {loading ? (
          <div className="h-8 w-28 rounded-md bg-muted-foreground/10 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-foreground">{(count ?? 0).toLocaleString()}</p>
        )}
      </div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}
