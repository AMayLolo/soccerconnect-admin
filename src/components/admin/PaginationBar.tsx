// src/components/admin/PaginationBar.tsx
// Blue pagination bar with "Showing x–y of z" info (light + dark mode)

export default function PaginationBar({
  page,
  totalPages,
  startItem,
  endItem,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400 sm:flex-row">
      <div>
        Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{total}</b> reports
      </div>

      <div className="flex gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 w-8 rounded-md border text-sm font-medium transition-all ${
              p === page
                ? "border-blue-500 bg-blue-600 text-white dark:bg-blue-500"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-blue-400 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-blue-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
