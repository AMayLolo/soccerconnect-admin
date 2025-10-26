// src/app/protected/flagged/ResolveFlaggedButton.tsx
// CLIENT COMPONENT

"use client";

import { handleResolve } from "./resolveFlaggedAction";

export function ResolveFlaggedButton({ reportId }: { reportId: string }) {
  return (
    <form action={handleResolve}>
      <input type="hidden" name="report_id" value={reportId} />
      <button
        type="submit"
        className="px-3 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
      >
        Mark Resolved
      </button>
    </form>
  );
}
