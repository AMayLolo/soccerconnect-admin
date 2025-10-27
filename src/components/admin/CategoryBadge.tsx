import { categoryColors } from "@/constants/reviewColors";

export default function CategoryBadge({ category }: { category: string | null }) {
  const normalized = (category || "").toLowerCase().trim();
  const colors = categoryColors[normalized] || categoryColors.default;

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-[2px] text-[11px] font-medium ${colors.border} ${colors.bg} ${colors.text}`}
    >
      {category ? category.charAt(0).toUpperCase() + category.slice(1) : "—"}
    </span>
  );
}

