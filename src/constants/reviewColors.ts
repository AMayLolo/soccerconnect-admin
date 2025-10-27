// src/constants/reviewColors.ts
export const categoryColors: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  staff: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  parent: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  coach: {
    border: "border-purple-300",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  referee: {
    border: "border-orange-300",
    bg: "bg-orange-50",
    text: "text-orange-700",
  },
  // Default fallback
  default: {
    border: "border-neutral-300",
    bg: "bg-neutral-100",
    text: "text-neutral-700",
  },
};
