export type Filters = Array<{ column: string; op: string; value: any }>

export function normalizeStatsKey(table: string, filters?: Filters) {
  if (!filters || filters.length === 0) return table
  const sorted = [...filters].sort((a, b) => (a.column > b.column ? 1 : a.column < b.column ? -1 : 0))
  const q = sorted
    .map((f) => {
      const v = typeof f.value === "string" ? f.value : JSON.stringify(f.value)
      return `${encodeURIComponent(f.column)}=${encodeURIComponent(String(v))}`
    })
    .join("&")
  return `${table}?${q}`
}

export default normalizeStatsKey
