// src/app/protected/reviews/page.tsx
import { createServerClientInstance } from "@/utils/supabase/server";
import { requireCurrentUser } from "@/utils/auth";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  // protect this route on the server
  await requireCurrentUser();

  const supabase = await createServerClientInstance();

  // Pull ALL reviews (you can later limit or paginate)
  // We are NOT joining clubs here because Supabase complained there's no FK
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
        id,
        created_at,
        rating,
        title,
        body,
        club_id,
        author_name,
        author_role
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading reviews:", error.message);
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            All Reviews
          </h1>
          <p className="text-sm text-neutral-500">
            Full review feed (newest first)
          </p>
        </div>
      </header>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Error loading reviews: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!error && (!reviews || reviews.length === 0) && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
          No reviews yet.
        </div>
      )}

      {/* Reviews table */}
      {!error && reviews && reviews.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm text-neutral-800">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Body</th>
                <th className="px-4 py-3 font-medium">Club ID</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {reviews.map((rev: any) => (
                <tr key={rev.id} className="align-top">
                  <td className="px-4 py-3 text-sm font-semibold text-neutral-900">
                    {rev.rating ?? "-"}
                  </td>

                  <td className="px-4 py-3 text-sm text-neutral-900 max-w-[200px] break-words">
                    {rev.title || "(no title)"}
                  </td>

                  <td className="px-4 py-3 text-sm text-neutral-700 max-w-[320px] break-words leading-relaxed">
                    {rev.body || "(no body)"}
                  </td>

                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {rev.club_id ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-xs text-neutral-600 leading-relaxed">
                    <div className="font-medium text-neutral-800">
                      {rev.author_name || "Anonymous"}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {rev.author_role || ""}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                    {rev.created_at
                      ? new Date(rev.created_at).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
