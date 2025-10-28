"use client";

import { useTransition } from "react";
import { resolveFlaggedAction } from "./resolveFlaggedAction";

export function ResolveFlaggedButton({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          const res = await resolveFlaggedAction(reportId);
          if (res.ok) {
            alert("✅ Report resolved successfully!");
          } else {
            alert(`❌ Failed to resolve: ${res.error}`);
          }
        })
      }
      disabled={isPending}
      className={`px-3 py-1 rounded-md text-sm font-medium text-white ${
        isPending
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isPending ? "Resolving..." : "Mark Resolved"}
    </button>
  );
}
