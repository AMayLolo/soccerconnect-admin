"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function EditClubPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [club, setClub] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load club on mount
  useEffect(() => {
    async function loadClub() {
      const { data, error } = await supabase.from("clubs").select("*").eq("id", params.id).single();
      if (error) console.error(error);
      else setClub(data);
    }
    loadClub();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!club) return;

    setLoading(true);
    setMessage(null);

    let logo_url = club.logo_url;

    if (logoFile) {
      const filePath = `logos/${params.id}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("club-logos")
        .upload(filePath, logoFile, { upsert: true });
      if (uploadError) {
        setMessage("Logo upload failed.");
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from("club-logos").getPublicUrl(filePath);
      logo_url = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("clubs")
      .update({
        club_name: club.club_name,
        city: club.city,
        state: club.state,
        website_url: club.website_url,
        competition_level: club.competition_level,
        ages: club.ages,
        about: club.about,
        logo_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("Update failed.");
    } else {
      setMessage("Club updated successfully!");
      router.push(`/protected/clubs/${params.id}`);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  if (!club) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-(--color-text)">
        Edit {club.club_name}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {["club_name", "city", "state", "website_url", "competition_level", "ages"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field.replace("_", " ")}
            </label>
            <input
              type="text"
              value={club[field] || ""}
              onChange={(e) => setClub({ ...club, [field]: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-(--color-teal)"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">About</label>
          <textarea
            rows={5}
            value={club.about || ""}
            onChange={(e) => setClub({ ...club, about: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-(--color-teal)"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Club Logo</label>
          <input type="file" accept="image/*" onChange={handleFileSelect} />
          {preview || club.logo_url ? (
            <div className="mt-3 relative w-32 h-32">
              <Image
                src={preview || club.logo_url}
                alt="Logo preview"
                fill
                className="object-contain rounded-md border border-gray-200 dark:border-gray-700"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload a PNG, JPG, or SVG logo.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-(--color-teal) text-white rounded-md hover:opacity-90 transition"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
