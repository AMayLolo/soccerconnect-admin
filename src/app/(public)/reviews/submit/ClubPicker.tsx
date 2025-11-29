"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Club = {
  id: string;
  club_name: string;
  city: string;
  state: string;
  logo_url?: string | null;
};

export default function ClubPicker() {
  const [allClubs, setAllClubs] = useState<Club[] | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const res = await fetch("/api/clubs/list", { signal: abortRef.current.signal });
        if (!res.ok) return;
        const data = await res.json();
        setAllClubs(data as Club[]);
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    if (!allClubs) fetchClubs();
  }, [allClubs]);

  const results = useMemo(() => {
    if (!allClubs) return [] as Club[];
    const q = query.trim().toLowerCase();
    if (!q) return allClubs.slice(0, 20);
    return allClubs
      .filter(c => c.club_name.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q))
      .slice(0, 20);
  }, [allClubs, query]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Find a club</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by club name or city..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d7a9b] focus:border-transparent"
        />
      </div>

      <div className="border border-gray-200 rounded-lg divide-y max-h-80 overflow-auto">
        {loading && (
          <div className="p-4 text-sm text-gray-500">Loading clubs…</div>
        )}
        {!loading && results.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No clubs match your search.</div>
        )}
        {results.map((club) => (
          <button
            key={club.id}
            onClick={() => router.push(`/reviews/submit?club_id=${club.id}`)}
            className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
              {club.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={club.logo_url} alt="" className="w-6 h-6 object-contain" />
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[#1c3f60] truncate">{club.club_name}</div>
              <div className="text-xs text-gray-500">{club.city}, {club.state}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
