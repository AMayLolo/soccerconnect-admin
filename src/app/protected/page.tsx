// src/app/protected/page.tsx
export const dynamic = "force-dynamic";

export default function ProtectedHomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {/* Card: Moderation Queue */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Flagged Reports
          </h2>
          <a
            href="/protected/flagged"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all →
          </a>
        </div>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          Reports waiting for review / resolution.
        </p>
      </div>

      {/* Card: Reviews */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Recent Reviews
          </h2>
          <a
            href="/protected/reviews"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all →
          </a>
        </div>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          Latest club feedback activity.
        </p>
      </div>

      {/* Card: Reports */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Reports
          </h2>
          <a
            href="/protected/reports"
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            View all →
          </a>
        </div>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          View individual report submissions from parents.
        </p>
      </div>

      {/* Card: System status / placeholder */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">
          System Status
        </h2>
        <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
          Auth, Supabase connection, and deployment are live.
        </p>
        <p className="mt-2 text-[11px] text-green-600 font-semibold">
          • All services operational
        </p>
      </div>
    </section>
  );
}
