"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getSupabaseServerReadOnly } from "@/lib/supabaseServerReadOnly";
import Link from "next/link";

type Report = {
  id: string;
  reason: string;
  resolved: boolean;
  created_at: string;
  reviews?: {
    title?: string;
    clubs?: { name?: string }[] | null;
  }[] | null;
};

export default function ReportsClient() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<Report[]>([]);
  const [isPending, startTransition] = useTransition();

  const page = searchParams.get("page") || "1";

  useEffect(() => {
    startTransition(async () => {
      const supabase = getSupabaseServerReadOnly();
      const { data, error } = await supabase
        .from("review_reports")
        .select("id, reason, resolved, created_at, reviews(title, clubs(name))")
        .order("created_at", { ascending: false })
        .limit(25);

      if (error) console.error("Error fetching reports:", error);
      else setReports(data || []);
    });
  }, [page]);

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Reason
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Club
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
              View
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isPending ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                Loading reports...
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No reports found.
              </td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 text-sm text-gray-800">{r.id}</td>
                <td className="px-4 py-2 text-sm text-gray-800">{r.reason}</td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {r.reviews?.[0]?.clubs?.[0]?.name || "—"}
                </td>
                <td className="px-4 py-2 text-sm">
                  {r.resolved ? (
                    <span className="text-green-600 font-medium">Resolved</span>
                  ) : (
                    <span className="text-red-500 font-medium">Pending</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/protected/reports/${r.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
