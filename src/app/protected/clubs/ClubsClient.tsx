"use client"

import { useSharedStats } from "@/components/StatsProvider"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, MapPin, Plus, Search } from 'lucide-react'
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Club = {
  id: string
  club_name: string
  city: string
  state: string
  logo_url?: string
  about?: string
  founded?: string
}

export default function ClubsClient({ initialClubs }: { initialClubs: Club[] }) {
  const [clubs, setClubs] = useState<Club[]>(initialClubs || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [cityFilter, setCityFilter] = useState("all")
  const [profileFilter, setProfileFilter] = useState("all")

  useEffect(() => {
    // mount
  }, [])

    // If for some reason the server-provided `initialClubs` did not arrive
    // (hydration/serialization issues or large payloads), fetch the list from
    // our same-origin API so the client UI still shows rows and derived counts.
    useEffect(() => {
      if ((initialClubs || []).length > 0) return

      let cancelled = false
      ;(async () => {
          try {
            const res = await fetch('/api/clubs/list', { credentials: 'same-origin' })
            if (!res.ok) {
              // fetch list failed
              return
            }
            const data = await res.json()
            if (cancelled) return
            setClubs(Array.isArray(data) ? data : (data?.data || []))
            // fetch list done
          } catch (err) {
            // fetch list error
          }
      })()

      return () => { cancelled = true }
      // Only run once on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  const { count: total = 0 } = useSharedStats("clubs")

  const isIncomplete = (club: Club) => {
    const bio = club.about
    return !club.logo_url || !bio || !club.founded || !club.city || !club.state
  }

  // derive complete/incomplete counts from the client list (falls back to
  // StatsProvider for total). This ensures the cards reflect what the table
  // shows immediately after hydration.
  const incompleteCount = useMemo(() => clubs.filter(isIncomplete).length, [clubs])
  const completeCount = Math.max(0, clubs.length - incompleteCount)

  // Log derived counts and shared total so we can see if the client and StatsProvider agree
  useEffect(() => {
    // Clubs counts computed
  }, [total, incompleteCount, completeCount, clubs.length])

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(clubs.map((club) => club.city).filter(Boolean as any)))
    return uniqueCities.sort()
  }, [clubs])

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        (club.club_name || "").toLowerCase().includes(q) ||
        (club.city || "").toLowerCase().includes(q) ||
        (club.state || "").toLowerCase().includes(q)

      const matchesCity = cityFilter === "all" || club.city === cityFilter

      const matchesProfile =
        profileFilter === "all" ||
        (profileFilter === "incomplete" && isIncomplete(club)) ||
        (profileFilter === "complete" && !isIncomplete(club))

      return matchesSearch && matchesCity && matchesProfile
    })
  }, [clubs, searchQuery, cityFilter, profileFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clubs Directory</h1>
          <p className="text-muted-foreground mt-1">Manage, review, and update all registered soccer clubs</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/protected/clubs/new">
            <Plus className="h-4 w-4" />
            Add New Club
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clubs</p>
                <p className="text-3xl font-bold mt-2">{total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Complete Profiles</p>
                <p className="text-3xl font-bold mt-2">{completeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incomplete Profiles</p>
                <p className="text-3xl font-bold mt-2">{incompleteCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search clubs by name, city, or state..." value={searchQuery} onChange={(e:any) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>

            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="w-full sm:w-[180px] border rounded-md px-3 py-2">
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} className="w-full sm:w-[180px] border rounded-md px-3 py-2">
              <option value="all">All Profiles</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          {(searchQuery || cityFilter !== "all" || profileFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {filteredClubs.length} of {clubs.length} clubs</span>
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setCityFilter("all"); setProfileFilter("all") }} className="h-auto p-0 text-xs">Clear filters</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="min-w-full table-auto text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 font-medium w-20">Logo</th>
              <th className="px-4 py-3 font-medium">Club Name</th>
              <th className="px-4 py-3 font-medium w-36">City</th>
              <th className="px-4 py-3 font-medium w-24">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredClubs.length > 0 ? (
              filteredClubs.map((club) => (
                <tr key={club.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                  <td className="px-4 py-3 align-middle">
                    {club.logo_url ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={club.logo_url} alt={club.club_name} />
                      </Avatar>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 min-w-0">
                    <Link href={`/protected/clubs/${club.id}`} className="block max-w-[48ch] text-wrap">{club.club_name || "N/A"}</Link>
                    {isIncomplete(club) && <Badge variant="destructive" className="ml-2">Incomplete</Badge>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{club.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{club.state || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No clubs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
