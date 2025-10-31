"use client";

import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewClubPage() {
  const router = useRouter();

  const [club, setClub] = useState({
    club_name: "",
    city: "",
    state: "",
    website_url: "",
    tryout_info_url: "",
    ages: "",
    competition_level: "",
    about: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(file: File | null) {
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Step 1: insert club (without logo yet)
    const { data: inserted, error: insertError } = await supabase
      .from("clubs")
      .insert([
        {
          club_name: club.club_name,
          city: club.city,
          state: club.state,
          website_url: club.website_url,
          tryout_info_url: club.tryout_info_url,
          ages: club.ages,
          competition_level: club.competition_level,
          about: club.about,
        },
      ])
      .select()
      .single();

    if (insertError || !inserted) {
      alert("Error creating club: " + insertError?.message);
      setSaving(false);
      return;
    }

    let logo_url: string | null = null;

    // Step 2: if a logo was selected, upload and attach URL
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `club-logos/${inserted.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        alert("Logo upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath);
      logo_url = publicUrl;

      // Step 3: update logo_url on the club record
      await supabase
        .from("clubs")
        .update({ logo_url })
        .eq("id", inserted.id);
    }

    setSaving(false);
    router.push(`/protected/clubs/${inserted.id}`);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Create New Club</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Club Name</label>
          <input
            type="text"
            value={club.club_name}
            onChange={(e) =>
              setClub({ ...club, club_name: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={club.city}
              onChange={(e) => setClub({ ...club, city: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={club.state}
              onChange={(e) => setClub({ ...club, state: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* URLs */}
        <div>
          <label className="block text-sm font-medium mb-1">Website URL</label>
          <input
            type="text"
            value={club.website_url}
            onChange={(e) =>
              setClub({ ...club, website_url: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tryout Info URL
          </label>
          <input
            type="text"
            value={club.tryout_info_url}
            onChange={(e) =>
              setClub({ ...club, tryout_info_url: e.target.value })
            }
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Competition Level / Ages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Competition Level
            </label>
            <input
              type="text"
              value={club.competition_level}
              onChange={(e) =>
                setClub({ ...club, competition_level: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ages</label>
            <input
              type="text"
              value={club.ages}
              onChange={(e) => setClub({ ...club, ages: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea
            rows={4}
            value={club.about}
            onChange={(e) => setClub({ ...club, about: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Logo</label>
          <div
            className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileChange(file);
            }}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Logo preview"
                width={128}
                height={128}
                className="mx-auto object-contain mb-2"
                unoptimized
              />
            ) : (
              <p className="text-gray-500 text-sm">Drag & drop a logo here</p>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="logoUpload"
              onChange={(e) =>
                handleFileChange(e.target.files?.[0] || null)
              }
            />
            <label
              htmlFor="logoUpload"
              className="text-blue-600 hover:underline cursor-pointer text-sm"
            >
              Choose a file
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/protected/clubs")}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Club"}
          </button>
        </div>
      </form>
    </div>
  );
}
