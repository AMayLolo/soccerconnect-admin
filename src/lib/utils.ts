import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn()
 * Merges Tailwind classes correctly and removes duplicates.
 * Supports conditional classes (`false`, `undefined`, etc.)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
