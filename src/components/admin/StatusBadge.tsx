// src/components/admin/StatusBadge.tsx
// Reusable badge for boolean states (Resolved / Unresolved, etc.)

export default function StatusBadge({
  value,
  trueLabel = "Resolved",
  falseLabel = "Unresolved",
}: {
  value: boolean | null;
  trueLabel?: string;
  falseLabel?: string;
}) {
  const active = !!value;
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[11px] font-medium ${
        active
          ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300"
          : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300"
      }`}
    >
      {active ? trueLabel : falseLabel}
    </span>
  );
}
