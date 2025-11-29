"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { LEAGUE_PRESETS } from "@/constants/leagues";
import {
  ALLOWED_LOGO_MIME_TYPES,
  LOGO_BUCKET,
} from "@/constants/storage";
import parseLeagues from "@/utils/parseLeagues";

export default function NewClubPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  // Form state
  const [club, setClub] = useState({
    club_name: "",
    city: "",
    state: "",
    website_url: "",
    tryout_info_url: "",
    ages: "",
    about: "",
    founded: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [leagues, setLeagues] = useState<string[]>([]);
  const [leagueInput, setLeagueInput] = useState("");

  // Merge user typed league inputs
  const mergeLeagueList = (current: string[], additions: string[]) => {
    const output = new Set(current.map(l => l.toLowerCase()));
    additions.forEach(entry => {
      const cleaned = entry.trim();
      if (cleaned && !output.has(cleaned.toLowerCase())) {
        current.push(cleaned);
        output.add(cleaned.toLowerCase());
      }
    });
    return [...current];
  };

  function handleFileChange(file: File | null) {
    if (!file) return;

    if (!ALLOWED_LOGO_MIME_TYPES.includes(file.type as any)) {
      alert("Only PNG, JPG, SVG files allowed.");
      return;
    }

    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const pending = parseLeagues(leagueInput);
    const finalLeagues = mergeLeagueList(leagues, pending);

    const competition_level = finalLeagues.join(", ");

    // 1️⃣ Create club record
    const { data: inserted, error: insertError } = await supabase
      .from("clubs")
      .insert({
        club_name: club.club_name,
        city: club.city,
        state: club.state,
        website_url: club.website_url,
        ages: club.ages,
        about: club.about,
        founded: club.founded || null,
        tryout_info_url: club.tryout_info_url,
        competition_level,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      alert("Error creating club: " + insertError?.message);
      setSaving(false);
      return;
    }

    let logo_url: string | null = null;

    // 2️⃣ Upload logo if provided
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const path = `club-logos/${inserted.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(LOGO_BUCKET)
        .upload(path, logoFile, {
          contentType: logoFile.type,
          upsert: true,
        });

      if (uploadError) {
        alert("Logo upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from(LOGO_BUCKET)
        .getPublicUrl(path);

      logo_url = urlData.publicUrl;

      await supabase
        .from("clubs")
        .update({ logo_url })
        .eq("id", inserted.id);
    }

    setSaving(false);
    router.push(`/protected/clubs/${inserted.id}`);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Club</h1>
        <p className="text-gray-600">Add a new soccer club to the directory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* BASIC INFO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
          <input
            type="text"
            placeholder="Enter club name"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
            value={club.club_name}
            onChange={(e) =>
              setClub({ ...club, club_name: e.target.value })
            }
            required
          />
        </div>

        {/* Other fields ... SAME AS BEFORE ... */}

        {/* SUBMIT BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push("/protected/clubs")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-[#0d7a9b] text-white rounded-md hover:bg-[#0a5f7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Creating..." : "Create Club"}
          </button>
        </div>
      </form>
    </div>
  );
}
