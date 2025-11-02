"use client"

import { getSupabaseClient } from "@/utils/supabase/client"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClubEditPage() {
  const router = useRouter()
  const params = useParams()
  const clubId = params?.id as string

  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
        setLoading(true)
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.from("clubs").select("*").eq("id", clubId).single()
      if (error) {
        console.error("Failed to load club:", error)
      } else if (mounted) {
        setClub(data)
        setPreview(data?.logo_url ?? null)
      }
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [clubId])

  function handleFileChange(file: File | null) {
    if (!file) return
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
      const filePath = `club-logos/${clubId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, logoFile, { upsert: true })
      if (uploadError) {
        alert("Logo upload failed: " + uploadError.message)
        setSaving(false)
        return
      }

      const { data: pub } = supabase.storage.from("logos").getPublicUrl(filePath)
      logo_url = pub?.publicUrl ?? logo_url
    }

    // Update the club record
    const { error } = await supabase
      .from("clubs")
      .update({
        club_name: club.club_name,
        city: club.city,
        state: club.state,
        website_url: club.website_url,
        tryout_info_url: club.tryout_info_url,
        ages: club.ages,
        competition_level: club.competition_level,
        about: club.about,
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
            <label className="block text-sm font-medium mb-1">Competition Level</label>
            <input
              type="text"
              value={club.competition_level ?? ""}
              onChange={(e) => setClub({ ...club, competition_level: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
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
          <button type="button" onClick={() => router.push("/protected/clubs") } className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  )
}
