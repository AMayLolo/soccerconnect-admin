"use client";

import { useTransition } from "react";
import { handleResolve } from "./resolveFlaggedAction";
import toast from "react-hot-toast";

type ResolveFlaggedButtonProps = {
  reportId: string;
  resolved: boolean;
};

export function ResolveFlaggedButton({
  reportId,
  resolved,
}: ResolveFlaggedButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function onClick() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("reportId", reportId);

      const res = await handleResolve(formData);

      if (res.ok) {
        toast.success("Report marked as resolved!");
      } else {
        toast.error(res.error || "Something went wrong");
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={isPending || resolved}
      className={`px-4 py-2 rounded-md text-white transition ${
        resolved
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {isPending
        ? "Resolving..."
        : resolved
        ? "Resolved"
        : "Mark as Resolved"}
    </button>
  );
}
