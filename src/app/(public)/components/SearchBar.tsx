"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ placeholder }: { placeholder?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/clubs?search=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={submit} className="flex gap-2 w-full">
      <input
        type="text"
        placeholder={placeholder || "Search clubs by name or city..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 rounded-md border px-4 py-2 text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-md bg-black text-white text-sm"
      >
        Search
      </button>
    </form>
  );
}
