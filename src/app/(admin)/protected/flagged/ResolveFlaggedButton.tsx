"use client";

import { useTransition, useState } from "react";
import { useNotify } from "../../../../../hooks/useNotify";
import { resolveFlaggedAction } from "./resolveFlaggedAction";

export default function ResolveFlaggedButton({
  reportId,
  onResolved,
}: {
  reportId: string;
  onResolved?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const notify = useNotify();

  const handleResolve = () => {
    setError(null);
    startTransition(async () => {
      const result = await resolveFlaggedAction(reportId);
      if (result.ok) {
        if (onResolved) onResolved(); // 🔥 triggers client-side update
        notify.success("Report resolved");
      } else {
        const msg = result.error || "Error resolving report";
        setError(msg);
        notify.error(msg);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleResolve}
        disabled={isPending}
        className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${
          isPending ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isPending ? "Resolving..." : "Resolve"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
