"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { useCallback, useEffect, useMemo, useState } from "react"

const ROLE_OPTIONS = [
  { value: "parent", label: "Parent / Guardian" },
  { value: "staff", label: "Club Staff / Coach" },
  { value: "club_admin", label: "Club Admin / Official Rep" },
] as const

type ClubOption = {
  id: string
  club_name: string
}

export default function UsersClient() {
  const supabase = getSupabaseBrowserClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<string>("parent")
  const [clubId, setClubId] = useState("")
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [statusMessage, setStatusMessage] = useState("")
  const [isSiteAdmin, setIsSiteAdmin] = useState(false)

  const [supportsDisplayName, setSupportsDisplayName] = useState(true)
  const [supportsFullName, setSupportsFullName] = useState(true)
  const [supportsRequestedRole, setSupportsRequestedRole] = useState(true)
  const [supportsApprovedRole, setSupportsApprovedRole] = useState(true)
  const [supportsStatusColumn, setSupportsStatusColumn] = useState(true)
  const [supportsClubId, setSupportsClubId] = useState(true)
  const [supportsWatchlist, setSupportsWatchlist] = useState(true)

  const [watchlistClubIds, setWatchlistClubIds] = useState<string[]>([])
  const [watchlistSelection, setWatchlistSelection] = useState("")
  const [watchlistMessage, setWatchlistMessage] = useState("")
  const [watchlistBusy, setWatchlistBusy] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" })
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)

  const detectProfileColumns = useCallback(async () => {
    const checks: Array<{ column: string; setter: (value: boolean) => void }> = [
      { column: "display_name", setter: setSupportsDisplayName },
      { column: "full_name", setter: setSupportsFullName },
      { column: "requested_role", setter: setSupportsRequestedRole },
      { column: "approved_role", setter: setSupportsApprovedRole },
      { column: "status", setter: setSupportsStatusColumn },
      { column: "club_id", setter: setSupportsClubId },
    ]

    await Promise.all(
      checks.map(async ({ column, setter }) => {
        const { error } = await supabase.from("profiles").select(column).limit(1)
        setter(!error)
      })
    )

    const { error: watchlistError } = await supabase
      .from("profile_club_watchlist")
      .select("user_id")
      .limit(1)

    if (watchlistError) {
      setSupportsWatchlist(false)
      setWatchlistMessage("Club watchlists are not available right now.")
    } else {
      setSupportsWatchlist(true)
    }
  }, [supabase])

  const fetchClubs = useCallback(async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("id, club_name")
      .order("club_name")

    if (!error && Array.isArray(data)) {
      setClubs(data)
    }
  }, [supabase])

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      setStatusMessage("Unable to load your session. Please refresh and sign in again.")
      setUserId(null)
      return
    }

    if (!user) {
      setStatusMessage("Sign in to manage your SoccerConnect profile.")
      setUserId(null)
      return
    }

    setUserEmail(user.email ?? null)
    setUserId(user.id)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      setStatusMessage(error.message ?? "Unable to load your profile right now.")
      return
    }

    if (!data) {
      setDisplayName("")
      setRole("parent")
      setClubId("")
      setIsSiteAdmin(false)
      setWatchlistClubIds([])
      return
    }

    const hasDisplayName = Object.prototype.hasOwnProperty.call(data, "display_name")
    const hasFullName = Object.prototype.hasOwnProperty.call(data, "full_name")
    const hasRequestedRole = Object.prototype.hasOwnProperty.call(data, "requested_role")
    const hasApprovedRole = Object.prototype.hasOwnProperty.call(data, "approved_role")
    const hasStatus = Object.prototype.hasOwnProperty.call(data, "status")
    const hasClubId = Object.prototype.hasOwnProperty.call(data, "club_id")

    if (hasDisplayName !== supportsDisplayName) setSupportsDisplayName(hasDisplayName)
    if (hasFullName !== supportsFullName) setSupportsFullName(hasFullName)
    if (hasRequestedRole !== supportsRequestedRole) setSupportsRequestedRole(hasRequestedRole)
    if (hasApprovedRole !== supportsApprovedRole) setSupportsApprovedRole(hasApprovedRole)
    if (hasStatus !== supportsStatusColumn) setSupportsStatusColumn(hasStatus)
    if (hasClubId !== supportsClubId) setSupportsClubId(hasClubId)

    const resolvedName = (hasDisplayName ? data.display_name : undefined) ?? (hasFullName ? data.full_name : undefined) ?? ""
    const resolvedRequestedRole = hasRequestedRole ? data.requested_role : undefined
    const resolvedApprovedRole = hasApprovedRole ? data.approved_role : undefined
    const resolvedRole = (resolvedRequestedRole as string | undefined) ?? (resolvedApprovedRole as string | undefined) ?? "parent"
    const siteAdmin = resolvedRole === "site_admin" || resolvedApprovedRole === "site_admin"

  setIsSiteAdmin(siteAdmin)
  setDisplayName(siteAdmin ? "Soccer Connect (Official)" : resolvedName || "")
  setRole(siteAdmin ? "site_admin" : (ROLE_OPTIONS.find((option) => option.value === resolvedRole)?.value ?? "parent"))
  setClubId(siteAdmin ? "" : (hasClubId ? (data.club_id as string | null | undefined) ?? "" : ""))
  }, [
    supabase,
    supportsDisplayName,
    supportsFullName,
    supportsRequestedRole,
    supportsApprovedRole,
    supportsStatusColumn,
    supportsClubId,
  ])

  const fetchWatchlist = useCallback(async () => {
    if (!supportsWatchlist) return
    if (!userId) {
      setWatchlistClubIds([])
      return
    }

    const { data, error } = await supabase
      .from("profile_club_watchlist")
      .select("club_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      if (error.message?.includes("profile_club_watchlist")) {
        setSupportsWatchlist(false)
      }
      setWatchlistMessage(error.message ?? "Unable to load your watchlist right now.")
      return
    }

    setWatchlistMessage("")
    const entries = Array.isArray(data) ? data : []
    setWatchlistClubIds(entries.map((entry: { club_id: string }) => entry.club_id).filter(Boolean))
  }, [supabase, supportsWatchlist, userId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      await detectProfileColumns()
      await Promise.all([fetchClubs(), fetchProfile()])
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [detectProfileColumns, fetchClubs, fetchProfile])

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  const statusTone = useMemo(() => {
    if (!statusMessage) return "text-muted-foreground"
    return statusMessage.toLowerCase().includes("error") || statusMessage.toLowerCase().includes("unable")
      ? "text-red-600"
      : "text-green-600"
  }, [statusMessage])

  const selectedClubLabel = useMemo(() => {
    if (!clubId) return ""
    const match = clubs.find((club) => club.id === clubId)
    return match?.club_name ?? ""
  }, [clubId, clubs])

  const watchlistClubs = useMemo(() => {
    return watchlistClubIds.map((id) => {
      const match = clubs.find((club) => club.id === id)
      return {
        id,
        club_name: match?.club_name ?? "Unknown Club",
      }
    })
  }, [watchlistClubIds, clubs])

  const availableWatchlistOptions = useMemo(() => {
    return clubs.filter((club) => !watchlistClubIds.includes(club.id))
  }, [clubs, watchlistClubIds])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatusMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatusMessage("Please sign in to save changes.")
      return
    }

    setSaving(true)

    const trimmedName = (isSiteAdmin ? "Soccer Connect (Official)" : displayName).trim()
    const payload: Record<string, any> = {
      user_id: user.id,
    }

    if (supportsDisplayName) payload.display_name = trimmedName
    if (supportsFullName) payload.full_name = trimmedName
    if (supportsClubId) payload.club_id = isSiteAdmin ? null : clubId || null

    const effectiveRole = isSiteAdmin ? "site_admin" : role
    const approvedRole = isSiteAdmin ? "site_admin" : role === "club_admin" ? "parent" : role
    const statusValue = isSiteAdmin ? "active" : role === "club_admin" ? "pending_review" : "active"

    if (supportsRequestedRole) payload.requested_role = effectiveRole
    if (supportsApprovedRole) payload.approved_role = approvedRole
    if (supportsStatusColumn) payload.status = statusValue

    const attempt = async (body: Record<string, any>) => {
      const { error } = await supabase.from("profiles").upsert(body)
      return error
    }

    const workingPayload: Record<string, any> = { ...payload }
    let error = await attempt(workingPayload)

    const columnErrors: Array<{
      marker: string
      setter: (value: boolean) => void
      key: keyof typeof workingPayload
    }> = [
      { marker: "'display_name' column", setter: setSupportsDisplayName, key: "display_name" },
      { marker: "'full_name' column", setter: setSupportsFullName, key: "full_name" },
      { marker: "'club_id' column", setter: setSupportsClubId, key: "club_id" },
      { marker: "'requested_role' column", setter: setSupportsRequestedRole, key: "requested_role" },
      { marker: "'approved_role' column", setter: setSupportsApprovedRole, key: "approved_role" },
      { marker: "'status' column", setter: setSupportsStatusColumn, key: "status" },
    ]

    for (const { marker, setter, key } of columnErrors) {
      if (error && error.message.includes(marker)) {
        setter(false)
        delete workingPayload[key]
        error = await attempt(workingPayload)
      }
    }

    if (error) {
      setStatusMessage(`Error saving profile: ${error.message}`)
    } else {
      setStatusMessage("Profile saved successfully.")
      await fetchProfile()
    }

    setSaving(false)
  }

  async function handleAddWatchlist() {
    if (!supportsWatchlist) return
    if (!userId) {
      setWatchlistMessage("Please sign in to manage your watchlist.")
      return
    }
    if (!watchlistSelection) {
      setWatchlistMessage("Select a club to add to your watchlist.")
      return
    }
    if (watchlistClubIds.includes(watchlistSelection)) {
      setWatchlistMessage("That club is already on your watchlist.")
      return
    }

    setWatchlistBusy(true)
    setWatchlistMessage("")

    const { error } = await supabase
      .from("profile_club_watchlist")
      .insert({ user_id: userId, club_id: watchlistSelection })

    if (error) {
      setWatchlistMessage(error.message ?? "Unable to add that club right now.")
    } else {
      setWatchlistClubIds((prev) => [...prev, watchlistSelection])
      setWatchlistSelection("")
      setWatchlistMessage("Club added to your watchlist.")
    }

    setWatchlistBusy(false)
  }

  async function handleRemoveWatchlist(clubIdToRemove: string) {
    if (!supportsWatchlist) return
    if (!userId) return

    setWatchlistBusy(true)
    setWatchlistMessage("")

    const { error } = await supabase
      .from("profile_club_watchlist")
      .delete()
      .eq("user_id", userId)
      .eq("club_id", clubIdToRemove)

    if (error) {
      setWatchlistMessage(error.message ?? "Unable to remove that club right now.")
    } else {
      setWatchlistClubIds((prev) => prev.filter((id) => id !== clubIdToRemove))
      setWatchlistMessage("Club removed from your watchlist.")
    }

    setWatchlistBusy(false)
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordMessage("")

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters long.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("Passwords do not match.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setPasswordMessage("Please sign in to update your password.")
      return
    }

    setPasswordSaving(true)

    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })

    if (error) {
      setPasswordMessage(error.message ?? "Unable to update your password right now.")
    } else {
      setPasswordMessage("Password updated successfully.")
      setPasswordForm({ newPassword: "", confirmPassword: "" })
    }

    setPasswordSaving(false)
  }

  const disableInputs = loading || saving || isSiteAdmin

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to SoccerConnect</h1>
        <p className="text-sm text-muted-foreground">
          Update your personal details and let clubs know how you are involved in the game.
        </p>
        {userEmail && <p className="text-xs text-muted-foreground">Signed in as {userEmail}</p>}
      </header>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading your profile…</p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Your Details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Keep your name and club info up to date so coaches and admins recognize you.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSiteAdmin ? (
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Display Name</p>
                    <p>Soccer Connect (Official)</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Club Access</p>
                    <p>All Clubs</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Role</p>
                    <p>Site Admin</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="displayName">
                        Display Name
                      </label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="e.g. Alex Johnson"
                        disabled={disableInputs}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="email">
                        Email
                      </label>
                      <Input id="email" value={userEmail ?? ""} disabled readOnly placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="club">
                      Your Club
                    </label>
                    <select
                      id="club"
                      value={clubId}
                      onChange={(event) => setClubId(event.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={disableInputs}
                    >
                      <option value="">– Select a Club –</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.club_name}
                        </option>
                      ))}
                    </select>
                    {selectedClubLabel === "" && clubId && (
                      <p className="text-xs text-muted-foreground">Club not found in directory. Your selection will still be saved.</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {!isSiteAdmin && (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Your Involvement</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tell us how you participate so we can tailor SoccerConnect for you.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium">I am a…</legend>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={role === option.value}
                          onChange={(event) => setRole(event.target.value)}
                          disabled={disableInputs}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Club Watchlist</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track clubs you care about so you can revisit them quickly.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!supportsWatchlist ? (
                <p className="text-sm text-muted-foreground">
                  {watchlistMessage || "Club watchlists are not available right now."}
                </p>
              ) : isSiteAdmin ? (
                <p className="text-sm text-muted-foreground">
                  Site admins have access to every club, so a watchlist is not needed.
                </p>
              ) : (
                <>
                  {watchlistClubs.length > 0 ? (
                    <ul className="space-y-2">
                      {watchlistClubs.map((club) => (
                        <li
                          key={club.id}
                          className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                        >
                          <span>{club.club_name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWatchlist(club.id)}
                            disabled={watchlistBusy}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      You have not added any clubs yet.
                    </p>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      value={watchlistSelection}
                      onChange={(event) => setWatchlistSelection(event.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={watchlistBusy}
                    >
                      <option value="">– Select a Club –</option>
                      {availableWatchlistOptions.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.club_name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={handleAddWatchlist}
                      disabled={watchlistBusy || !watchlistSelection}
                    >
                      {watchlistBusy ? "Saving…" : "Add Club"}
                    </Button>
                  </div>

                  {watchlistMessage && (
                    <p className={`text-sm ${watchlistMessage.toLowerCase().includes("unable") ? "text-red-600" : "text-muted-foreground"}`}>
                      {watchlistMessage}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {!isSiteAdmin && (
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={disableInputs}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}
          {statusMessage && (
            <p className={`text-sm ${statusTone}`}>{statusMessage}</p>
          )}
        </form>
      )}

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Update Password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a strong password to keep your SoccerConnect account secure.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-password">
                New Password
              </label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                placeholder="Enter a new password"
                disabled={passwordSaving}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirm-password">
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                placeholder="Re-enter the new password"
                disabled={passwordSaving}
                required
                minLength={8}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Updating…" : "Update Password"}
              </Button>
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.toLowerCase().includes("unable") || passwordMessage.toLowerCase().includes("must") ? "text-red-600" : "text-green-600"}`}>
                {passwordMessage}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
