"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { X } from "lucide-react";

/* -----------------------------------------
   TYPES
----------------------------------------- */

type Club = {
  id: string;
  club_name: string;
  city: string | null;
  state: string | null;
  competition_level: string | null;
  badge_logo_url: string | null;
  about_preview: string | null;
};

/* -----------------------------------------
   HOOK: Debounce Utility
----------------------------------------- */
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

/* -----------------------------------------
   MAIN COMPONENT
----------------------------------------- */
export default function ClubsPage() {
  const supabase = createClientComponentClient();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [compFilter, setCompFilter] = useState("All");

  const debouncedSearch = useDebounce(search);

  /* -----------------------------------------
     Load Clubs
  ----------------------------------------- */
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("clubs")
        .select(
          "id, club_name, city, state, competition_level, badge_logo_url, about_preview"
        )
        .order("club_name");

      setClubs((data || []) as Club[]);
      setLoading(false);
    }
    load();
  }, []);

  /* -----------------------------------------
     Build Filter Lists
  ----------------------------------------- */
  const cities = useMemo(() => {
    const values = clubs.map((c) => c.city).filter(Boolean) as string[];
    return ["All", ...new Set(values)];
  }, [clubs]);

  const states = useMemo(() => {
    const values = clubs.map((c) => c.state).filter(Boolean) as string[];
    return ["All", ...new Set(values)];
  }, [clubs]);

  const compLevels = useMemo(() => {
    const values = clubs
      .map((c) => c.competition_level)
      .filter(Boolean) as string[];
    return ["All", ...new Set(values)];
  }, [clubs]);

  /* -----------------------------------------
     Filter Results
  ----------------------------------------- */
  const filteredClubs: Club[] = useMemo(() => {
    return clubs.filter((c) => {
      const matchesSearch =
        c.club_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.city?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCity = cityFilter === "All" || c.city === cityFilter;
      const matchesState = stateFilter === "All" || c.state === stateFilter;
      const matchesComp =
        compFilter === "All" || c.competition_level === compFilter;

      return matchesSearch && matchesCity && matchesState && matchesComp;
    });
  }, [clubs, debouncedSearch, cityFilter, stateFilter, compFilter]);

  const hasActiveFilters =
    search !== "" ||
    cityFilter !== "All" ||
    stateFilter !== "All" ||
    compFilter !== "All";

  function clearAll() {
    setSearch("");
    setCityFilter("All");
    setStateFilter("All");
    setCompFilter("All");
  }

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */
  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Find a Soccer Club</h1>

      {/* ---------------- Filter Bar ---------------- */}
      <div className="space-y-4 border rounded-lg p-4 bg-card">
        {/* Search + Select Row */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
          {/* Search */}
          <Input
            placeholder="Search clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lg:w-72"
          />

          {/* City */}
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* State */}
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Competition Level */}
          <Select value={compFilter} onValueChange={setCompFilter}>
            <SelectTrigger className="w-full lg:w-56">
              <SelectValue placeholder="Competition Level" />
            </SelectTrigger>
            <SelectContent>
              {compLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 items-center">
            {search !== "" && (
              <FilterChip label={`Search: ${search}`} onClear={() => setSearch("")} />
            )}
            {cityFilter !== "All" && (
              <FilterChip label={cityFilter} onClear={() => setCityFilter("All")} />
            )}
            {stateFilter !== "All" && (
              <FilterChip label={stateFilter} onClear={() => setStateFilter("All")} />
            )}
            {compFilter !== "All" && (
              <FilterChip label={compFilter} onClear={() => setCompFilter("All")} />
            )}

            <button
              onClick={clearAll}
              className="text-xs underline text-muted-foreground ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ---------------- Club Grid ---------------- */}
      {loading ? (
        <p>Loading clubs...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="border rounded-lg p-4 hover:shadow-lg transition bg-card"
            >
              <div className="flex items-center gap-4 mb-3">
                <Image
                  src={club.badge_logo_url || "/placeholder.png"}
                  width={50}
                  height={50}
                  alt={club.club_name}
                  className="rounded-md object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">{club.club_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {club.city}, {club.state}
                  </p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">
                {club.about_preview}
              </p>
              <p className="mt-2 text-xs text-primary">{club.competition_level}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------
   FILTER CHIP COMPONENT
----------------------------------------- */
function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded-full bg-muted">
      {label}
      <X
        className="w-3 h-3 cursor-pointer text-muted-foreground"
        onClick={onClear}
      />
    </span>
  );
}
