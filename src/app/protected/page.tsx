"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { notify } from "@/hooks/useNotify";

export const dynamic = "force-dynamic";

type Counts = {
  flagged: number;
  reviews: number;
  reports: number;
};

export default function ProtectedHomePage() {
  const [counts, setCounts] = useState<Counts>({
    flagged: 0,
    reviews: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ===== Fetch dashboard counts =====
  async function loadCounts(showToast = false) {
    try {
      if (!loading) setRefreshing(true);

      const [flaggedRes, reviewsRes, reportsRes] = await Promise.all([
        supabase
          .from("review_reports")
          .select("*", { count: "exact", head: true })
          .eq("resolved", false),
        supabase
          .from("reviews")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("reports")
          .select("*", { count: "exact", head: true }),
      ]);

      setCounts({
        flagged: flaggedRes.count ?? 0,
        reviews: reviewsRes.count ?? 0,
        reports: reportsRes.count ?? 0,
      });

      if (showToast) notify.info("Dashboard auto-updated 🔄");
      else notify.success("Dashboard loaded successfully ✅");
    } catch (err: any) {
      console.error("Error loading counts:", err);
      notify.error("Failed to load dashboard counts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCounts();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => loadCounts(true), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* ===== Page Header ===== */}
      <header className="animate-slideUpBlur delay-75 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage reports, reviews, and system health from one place.
          </p>
        </div>

        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-blue-600 animate-pulse">
            <span className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" />
            <span>Refreshing...</span>
          </div>
        )}
      </header>

      {/* ===== Grid of Cards ===== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Flagged Reports"
          href="/protected/flagged"
          description="Reports awaiting moderation or resolution."
          icon="🚩"
          stat={counts.flagged}
          statColor="text-red-600"
          delay="100"
          loading={loading}
        />

        <DashboardCard
          title="All Reviews"
          href="/protected/reviews"
          description="Latest feedback and club ratings from users."
          icon="💬"
          stat={counts.reviews}
          statColor="text-blue-600"
          delay="200"
          loading={loading}
        />

        <DashboardCard
          title="Reports"
          href="/protected/reports"
          description="Individual report submissions from parents."
          icon="📄"
          stat={counts.reports}
          statColor="text-amber-600"
          delay="300"
          loading={loading}
        />

        <DashboardCard
          title="System Status"
          href="/protected/status"
          description="Monitor Supabase, Auth, and deployment health."
          icon="🟢"
          stat="OK"
          statColor="text-green-600"
          delay="400"
          loading={false}
        />
      </div>

      {/* ===== Footer ===== */}
      <footer className="mt-8 border-t border-neutral-200 pt-4 text-center text-[12px] text-neutral-500">
        © {new Date().getFullYear()} SoccerConnect Admin — All systems operational
      </footer>
    </section>
  );
}

/* ===== Reusable Card Component ===== */
function DashboardCard({
  title,
  href,
  description,
  icon,
  stat,
  statColor,
  delay,
  loading,
}: {
  title: string;
  href: string;
  description: string;
  icon: string;
  stat?: number | string;
  statColor: string;
  delay?: string;
  loading?: boolean;
}) {
  return (
    <a
      href={href}
      className={`group animate-slideUpBlur delay-${delay} block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-neutral-300`}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 transition">
          {title}
        </div>
        <div className={`text-xl ${statColor}`}>{icon}</div>
      </div>

      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
        {description}
      </p>

      {/* Stat area */}
      <div className="mt-3 flex items-center justify-between">
        {loading ? (
          <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
        ) : (
          <div
            className={`text-lg font-bold ${statColor} transition-all duration-300`}
          >
            {typeof stat === "number" ? stat.toLocaleString() : stat}
          </div>
        )}
        <div className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition">
          View details →
        </div>
      </div>
    </a>
  );
}
