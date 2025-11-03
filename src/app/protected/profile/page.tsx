"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [clubId, setClubId] = useState("");
  const [role, setRole] = useState("parent");
  const [clubs, setClubs] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [supportsDisplayName, setSupportsDisplayName] = useState(true);
  const [supportsFullName, setSupportsFullName] = useState(true);
  const [supportsRequestedRole, setSupportsRequestedRole] = useState(true);
  const [supportsApprovedRole, setSupportsApprovedRole] = useState(true);
  const [supportsStatusColumn, setSupportsStatusColumn] = useState(true);
  const [supportsClubId, setSupportsClubId] = useState(true);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const fetchClubs = useCallback(async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("id, club_name")
      .order("club_name");
    if (!error && data) setClubs(data);
  }, [supabase]);

  const detectProfileColumns = useCallback(async () => {
    const checks: Array<{ column: string; setter: (value: boolean) => void }> = [
      { column: "display_name", setter: setSupportsDisplayName },
      { column: "full_name", setter: setSupportsFullName },
      { column: "requested_role", setter: setSupportsRequestedRole },
      { column: "approved_role", setter: setSupportsApprovedRole },
      { column: "status", setter: setSupportsStatusColumn },
      { column: "club_id", setter: setSupportsClubId },
    ];

    await Promise.all(
      checks.map(async ({ column, setter }) => {
        const { error } = await supabase.from("profiles").select(column).limit(1);
        setter(!error);
      })
    );
  }, [supabase]);

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email ?? null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      const hasDisplayName = Object.prototype.hasOwnProperty.call(data, "display_name");
      const hasFullName = Object.prototype.hasOwnProperty.call(data, "full_name");
      const hasRequestedRole = Object.prototype.hasOwnProperty.call(data, "requested_role");
      const hasApprovedRole = Object.prototype.hasOwnProperty.call(data, "approved_role");
      const hasStatus = Object.prototype.hasOwnProperty.call(data, "status");
      const hasClubIdColumn = Object.prototype.hasOwnProperty.call(data, "club_id");

      if (hasDisplayName !== supportsDisplayName) setSupportsDisplayName(hasDisplayName);
      if (hasFullName !== supportsFullName) setSupportsFullName(hasFullName);
      if (hasRequestedRole !== supportsRequestedRole) setSupportsRequestedRole(hasRequestedRole);
      if (hasApprovedRole !== supportsApprovedRole) setSupportsApprovedRole(hasApprovedRole);
      if (hasStatus !== supportsStatusColumn) setSupportsStatusColumn(hasStatus);
      if (hasClubIdColumn !== supportsClubId) setSupportsClubId(hasClubIdColumn);

      const resolvedName =
        (hasDisplayName ? data.display_name : undefined) ??
        (hasFullName ? data.full_name : undefined) ??
        "";

      const resolvedRequestedRole = hasRequestedRole ? (data.requested_role as string | undefined) : undefined;
      const resolvedApprovedRole = hasApprovedRole ? (data.approved_role as string | undefined) : undefined;
      const resolvedRole = resolvedRequestedRole ?? resolvedApprovedRole ?? "parent";
      const siteAdmin = resolvedRole === "site_admin" || resolvedApprovedRole === "site_admin";
      const normalizedRole = siteAdmin
        ? "site_admin"
        : ["parent", "staff", "club_admin"].includes(resolvedRole ?? "")
        ? (resolvedRole as string)
        : "parent";

      setIsSiteAdmin(siteAdmin);
      setDisplayName(siteAdmin ? "Soccer Connect (Official)" : resolvedName || "");
      setClubId(hasClubIdColumn ? (data.club_id as string | null | undefined) || "" : "");
      setRole(normalizedRole);
    }

    setLoading(false);
  }, [
    supabase,
    supportsDisplayName,
    supportsFullName,
    supportsRequestedRole,
    supportsApprovedRole,
    supportsStatusColumn,
    supportsClubId,
  ]);

  useEffect(() => {
    const run = async () => {
      await detectProfileColumns();
      await fetchProfile();
      await fetchClubs();
    };
    run();
  }, [detectProfileColumns, fetchProfile, fetchClubs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatusMessage("You must be signed in.");
      setLoading(false);
      return;
    }

    const effectiveRole = isSiteAdmin ? "site_admin" : role;
    const status = isSiteAdmin
      ? "active"
      : role === "club_admin"
      ? "pending_review"
      : "active";
    const approved_role = isSiteAdmin
      ? "site_admin"
      : role === "club_admin"
      ? "parent"
      : role;

    const payload: Record<string, any> = {
      user_id: user.id,
    };

    const trimmedName = (isSiteAdmin ? "Soccer Connect (Official)" : displayName).trim();
    if (supportsDisplayName) payload.display_name = trimmedName;
    if (supportsFullName) payload.full_name = trimmedName;
    if (supportsClubId) payload.club_id = isSiteAdmin ? null : clubId || null;
    if (supportsRequestedRole) payload.requested_role = effectiveRole;
    if (supportsApprovedRole) payload.approved_role = approved_role;
    if (supportsStatusColumn) payload.status = status;

    const attempt = async (body: Record<string, any>) => {
      const { error: err } = await supabase.from("profiles").upsert(body);
      return err;
    };

    const workingPayload: Record<string, any> = { ...payload };
    let error = await attempt(workingPayload);

    if (error && error.message.includes("'display_name' column")) {
      setSupportsDisplayName(false);
      delete workingPayload.display_name;
      if (!workingPayload.full_name && trimmedName) {
        workingPayload.full_name = trimmedName;
      }
      error = await attempt(workingPayload);
    }

    if (error && error.message.includes("'full_name' column")) {
      setSupportsFullName(false);
      delete workingPayload.full_name;
      error = await attempt(workingPayload);
    }

    if (error && error.message.includes("'club_id' column")) {
      setSupportsClubId(false);
      delete workingPayload.club_id;
      error = await attempt(workingPayload);
    }

    if (error && error.message.includes("'requested_role' column")) {
      setSupportsRequestedRole(false);
      delete workingPayload.requested_role;
      error = await attempt(workingPayload);
    }

    if (error && error.message.includes("'approved_role' column")) {
      setSupportsApprovedRole(false);
      delete workingPayload.approved_role;
      error = await attempt(workingPayload);
    }

    if (error && error.message.includes("'status' column")) {
      setSupportsStatusColumn(false);
      delete workingPayload.status;
      error = await attempt(workingPayload);
    }

    if (error) {
      setStatusMessage("Error saving profile: " + error.message);
    } else {
      setStatusMessage(
        status === "pending_review"
          ? "Submitted! Your Club Admin request is pending approval."
          : "Profile saved successfully."
      );
    }
    setLoading(false);
  }

  const statusTone = useMemo(() => {
    if (!statusMessage) return "text-muted-foreground";
    return statusMessage.includes("Error") ? "text-red-600" : "text-green-600";
  }, [statusMessage]);

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-2">Your Profile</h1>
      {userEmail && <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>}
      <p className="text-sm text-muted-foreground mt-4 mb-8">
        Choose your role. Club Admin requests will require manual approval.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSiteAdmin ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <p className="text-sm text-muted-foreground">Soccer Connect (Official)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Associated Club</label>
              <p className="text-sm text-muted-foreground">All Clubs</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <p className="text-sm text-muted-foreground">Site Admin</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="e.g. Coach Ryan, Parent 2013 Girls"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Associated Club</label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">– Select a Club –</option>
                {clubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.club_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">I am a...</label>
              <div className="space-y-2">
                {["parent", "staff", "club_admin"].map((r) => (
                  <label key={r} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={role === r}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span className="capitalize">
                      {r === "club_admin"
                        ? "Club Admin / Official Rep"
                        : r === "staff"
                        ? "Club Staff / Coach"
                        : "Parent / Guardian"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {statusMessage && (
          <p className={`mt-4 text-sm ${statusTone}`}>{statusMessage}</p>
        )}
      </form>
    </div>
  );
}
