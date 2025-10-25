import { cookies } from "next/headers";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { resolveFlaggedReport } from "../../flagged/resolveFlaggedReports";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: { id: string };
};

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = params;

  const cookieStore = await cookies();
  const supabase = await createSupabaseServer();

  supabase.auth.setSession({
    access_token: cookieStore.get("sb-access-token")?.value ?? "",
    refresh_token: cookieStore.get("sb-refresh-token")?.value ?? "",
  });

  // -----------------------------
  // Fetch the report details
  // -----------------------------
  const { data, error } = await supabase
    .from("review_reports")
    .select(
      `
        id,
        reason,
        created_at,
        resolved,
        reviews:review_id (
          id,
          rating,
          comment,
          category,
          inserted_at,
          clubs:club_id (
            name
          )
        )
      `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error loading report:", error);
    notFound();
  }

  // -----------------------------
  // Normalize for render
  // -----------------------------
  const report = {
    id: data.id,
    reason: data.reason,
    created_at: data.created_at,
    resolved: data.resolved,
    review: {
      rating: data.reviews?.[0]?.rating ?? null,
      comment: data.reviews?.[0]?.comment ?? "",
      category: data.reviews?.[0]?.category ?? "",
      inserted_at: data.reviews?.[0]?.inserted_at ?? "",
      club_name: data.reviews?.[0]?.clubs?.[0]?.name ?? "Unknown Club",
    },
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Report Detail
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            <Link
              href="/protected/flagged"
              className="text-blue-600 hover:underline"
            >
              ← Back to Flagged Reports
            </Link>
          </p>
        </div>

        {report.resolved ? (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-100 text-green-700 text-sm font-medium border border-green-200">
            ✅ Resolved
          </span>
        ) : (
          <form
            action={async () => {
              "use server";
              await resolveFlaggedReport(report.id);
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Mark as Resolved
            </button>
          </form>
        )}
      </header>

      {/* Report Meta */}
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Report Information
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <dt className="font-medium text-gray-600">Report ID</dt>
            <dd className="mt-1">{report.id}</dd>
          </div>

          <div>
            <dt className="font-medium text-gray-600">Reported At</dt>
            <dd className="mt-1">
              {new Date(report.created_at).toLocaleString()}
            </dd>
          </div>

          <div className="md:col-span-2">
            <dt className="font-medium text-gray-600">Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap">
              {report.reason ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Review Details */}
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Linked Review
        </h2>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <dt className="font-medium text-gray-600">Club</dt>
            <dd className="mt-1">{report.review.club_name}</dd>
          </div>

          <div>
            <dt className="font-medium text-gray-600">Rating</dt>
            <dd className="mt-1">
              {report.review.rating != null
                ? `${report.review.rating}/5`
                : "—"}
            </dd>
          </div>

          <div>
            <dt className="font-medium text-gray-600">Category</dt>
            <dd className="mt-1">{report.review.category || "—"}</dd>
          </div>

          <div>
            <dt className="font-medium text-gray-600">Reviewed On</dt>
            <dd className="mt-1">
              {report.review.inserted_at
                ? new Date(report.review.inserted_at).toLocaleString()
                : "—"}
            </dd>
          </div>

          <div className="md:col-span-2">
            <dt className="font-medium text-gray-600">Comment</dt>
            <dd className="mt-1 whitespace-pre-wrap">
              {report.review.comment || "—"}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
