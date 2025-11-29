"use client"

import { LEAGUE_PRESETS } from "@/constants/leagues"
import { ALLOWED_LOGO_MIME_TYPES, LOGO_BUCKET } from "@/constants/storage"
import parseLeagues from "@/utils/parseLeagues"
import { createSupabaseBrowserClient } from "@/utils/supabase/client"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const mergeLeagueList = (current: string[], additions: string[]): string[] => {
  if (!additions || additions.length === 0) return current
  const existing = new Set(current.map((item) => item.toLowerCase()))
  const merged = [...current]
  additions.forEach((entry) => {
    const normalized = entry.trim()
    if (!normalized) return
    const key = normalized.toLowerCase()
    if (!existing.has(key)) {
      merged.push(normalized)
      existing.add(key)
    }
  })
  return merged
}

export default function ClubEditPage() {
  const router = useRouter()
  const params = useParams()
  const clubId = params?.id as string

  const supabaseClient = useMemo(() => createSupabaseBrowserClient(), [])

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [leagues, setLeagues] = useState<string[]>([])
  const [leagueInput, setLeagueInput] = useState("")

  useEffect(() => {
    let mounted = true
    async function load() {
        setLoading(true)
  const { data, error } = await supabaseClient.from("clubs").select("*").eq("id", clubId).single()
      if (error) {
        console.error("Failed to load club:", error)
      } else if (mounted) {
  setClub({ ...data, founded: data?.founded ?? "" })
        setPreview(data?.logo_url ?? null)
        setLeagues(parseLeagues(data?.competition_level ?? data?.league ?? ""))
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [clubId, supabaseClient])

  function handleFileChange(file: File | null) {
    if (!file) return
  if (!ALLOWED_LOGO_MIME_TYPES.includes(file.type as (typeof ALLOWED_LOGO_MIME_TYPES)[number])) {
    alert("Logo upload failed: Only PNG, JPG, or SVG images are allowed.")
      return
    }

    setLogoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!club) return
    setSaving(true)

    // If a new logo was selected, upload it first
    let logo_url = club.logo_url || null
    if (logoFile) {
    const fileExt = logoFile.name.split(".").pop()
    const filePath = `club-logos/${clubId}/${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabaseClient.storage.from(LOGO_BUCKET).upload(filePath, logoFile, {
        upsert: true,
        contentType: logoFile.type,
      })
      if (uploadError) {
        alert("Logo upload failed: " + uploadError.message)
        setSaving(false)
        return
      }

  const { data: pub } = supabaseClient.storage.from(LOGO_BUCKET).getPublicUrl(filePath)
      logo_url = pub?.publicUrl ?? logo_url
    }

    // Update the club record
    const pending = parseLeagues(leagueInput)
    const normalizedLeagues = mergeLeagueList(leagues, pending)

    if (pending.length > 0) {
      setLeagues(normalizedLeagues)
      setLeagueInput("")
    }

    const competitionLevels = normalizedLeagues.join(", ")

    const { error } = await supabaseClient
      .from("clubs")
      .update({
        club_name: club.club_name,
        city: club.city,
        state: club.state,
        website_url: club.website_url,
        tryout_info_url: club.tryout_info_url,
        ages: club.ages,
        competition_level: competitionLevels,
        about: club.about,
        founded: club.founded || null,
        logo_url,
      })
      .eq("id", clubId)

    if (error) {
      alert("Failed to update club: " + error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    router.push(`/protected/clubs/${clubId}`)
  }

  if (loading) return <div className="p-8 max-w-3xl mx-auto">Loading…</div>
  if (!club) return <div className="p-8 max-w-3xl mx-auto">Club not found.</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Club</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Club Name</label>
          <input
            type="text"
            value={club.club_name ?? ""}
            onChange={(e) => setClub({ ...club, club_name: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Founded</label>
          <input
            type="text"
            placeholder="e.g. 1998"
            value={club.founded ?? ""}
            onChange={(e) => setClub({ ...club, founded: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={club.city ?? ""}
              onChange={(e) => setClub({ ...club, city: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={club.state ?? ""}
              onChange={(e) => setClub({ ...club, state: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            type="text"
            value={club.website_url ?? ""}
            onChange={(e) => setClub({ ...club, website_url: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tryout Info URL</label>
          <input
            type="text"
            value={club.tryout_info_url ?? ""}
            onChange={(e) => setClub({ ...club, tryout_info_url: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Leagues</label>
            <div className="rounded-md border border-gray-200 px-3 py-2 dark:border-gray-700">
              {leagues.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {leagues.map((league) => (
                    <span
                      key={league}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                    >
                      {league}
                      <button
                        type="button"
                        onClick={() =>
                          setLeagues((prev) => prev.filter((item) => item.toLowerCase() !== league.toLowerCase()))
                        }
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-200 dark:hover:text-white"
                        aria-label={`Remove ${league}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mb-2 text-xs text-muted-foreground">No leagues added yet.</p>
              )}
              <input
                type="text"
                value={leagueInput}
                onChange={(e) => setLeagueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault()
                    const entries = parseLeagues(leagueInput)
                    if (entries.length > 0) {
                      setLeagues((prev) => mergeLeagueList(prev, entries))
                      setLeagueInput("")
                    }
                  }
                }}
                onBlur={() => {
                  const entries = parseLeagues(leagueInput)
                  if (entries.length > 0) {
                    setLeagues((prev) => mergeLeagueList(prev, entries))
                    setLeagueInput("")
                  }
                }}
                placeholder="Type a league and press Enter"
                className="w-full border-0 bg-transparent px-0 py-1 text-sm outline-none"
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Press Enter or use commas to add multiple leagues. These display as filterable tags on the club profile.
              </p>
              {LEAGUE_PRESETS.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {LEAGUE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setLeagues((prev) => mergeLeagueList(prev, [preset.name]))}
                      className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ages</label>
            <input
              type="text"
              value={club.ages ?? ""}
              onChange={(e) => setClub({ ...club, ages: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea
            rows={4}
            value={club.about ?? ""}
            onChange={(e) => setClub({ ...club, about: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          <div
            className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (file) handleFileChange(file)
            }}
          >
            {preview ? (
              <Image src={preview} alt="Logo preview" width={128} height={128} className="mx-auto object-contain mb-2" unoptimized />
            ) : (
              <p className="text-gray-500 text-sm">Drag & drop a logo here</p>
            )}
            <input type="file" accept="image/*" className="hidden" id="logoUpload" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
            <label htmlFor="logoUpload" className="text-blue-600 hover:underline cursor-pointer text-sm">Choose a file</label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push("/protected/clubs") } className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0d7a9b] hover:bg-[#0a5f7a] text-white rounded-md disabled:opacity-60 transition-colors">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  )
}
