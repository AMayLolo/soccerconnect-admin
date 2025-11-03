export type LeaguePreset = {
  name: string
  aliases?: string[]
}

export const LEAGUE_PRESETS: LeaguePreset[] = [
  {
    name: "ECNL",
    aliases: ["ECNL Boys", "ECNL Girls", "Elite Clubs National League"],
  },
  {
    name: "MLS NEXT",
    aliases: ["MLS Next", "MLS NEXT Academy", "MLSNext"],
  },
  {
    name: "GA",
    aliases: ["Girls Academy", "The Girls Academy"],
  },
  {
    name: "USL Academy",
    aliases: ["USL Academy League", "USL"],
  },
  {
    name: "NPL",
    aliases: ["National Premier Leagues"],
  },
  {
    name: "ECNL Regional League",
    aliases: ["ECNL RL","ECNL RL Boys","ECNL RL Girls"],
  },
]

const aliasMap: Record<string, string> = {}

for (const preset of LEAGUE_PRESETS) {
  aliasMap[preset.name.toLowerCase()] = preset.name
  for (const alias of preset.aliases || []) {
    aliasMap[alias.toLowerCase()] = preset.name
  }
}

export const canonicalizeLeague = (label: string): string => {
  const normalized = label.trim()
  if (!normalized) return ""
  return aliasMap[normalized.toLowerCase()] || normalized.replace(/\s+/g, " ")
}
