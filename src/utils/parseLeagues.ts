import { canonicalizeLeague } from "@/constants/leagues"

export function parseLeagues(value?: string | null): string[] {
  if (!value) return []

  return value
    .split(/[,;\n|/]+/)
    .map((entry) => entry.trim())
    .map((entry) => canonicalizeLeague(entry))
    .filter((entry, index, self) => entry.length > 0 && self.findIndex((compare) => compare.toLowerCase() === entry.toLowerCase()) === index)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
}

export default parseLeagues
