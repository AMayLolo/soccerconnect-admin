// src/components/admin/TableShimmer.tsx
// Subtle full-table shimmer overlay (light + dark mode)

export default function TableShimmer() {
  return (
    <div className="absolute inset-0 z-10 animate-pulse rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-200 opacity-70 dark:from-neutral-800 dark:to-neutral-900" />
  );
}
