"use client";

import { useState } from "react";
import ResolveFlaggedButton from "./ResolveFlaggedButton";

export default function FlaggedTableClient({ reports }: { reports: any[] }) {
  const [data, setData] = useState(reports);

  const handleResolved = (id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id)); // 🔥 instantly remove row
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">Review ID</th>
            <th className="px-4 py-2">Reported By</th>
            <th className="px-4 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.reason || "N/A"}</td>
                <td className="px-4 py-2">{r.review_id || "N/A"}</td>
                <td className="px-4 py-2">{r.reported_by || "Unknown"}</td>
                <td className="px-4 py-2 text-right">
                  <ResolveFlaggedButton
                    reportId={r.id}
                    onResolved={() => handleResolved(r.id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                🎉 All reports resolved!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
