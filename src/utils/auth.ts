import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerClientInstance } from "./supabase/server";

const ADMIN_DASHBOARD_ROLES = new Set(["site_admin", "club_admin", "staff"]);

const normalize = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim().toLowerCase() : null

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (error.message === "Auth session missing!") {
      return null;
    }

    console.error("getCurrentUser failed:", error.message);
    return null;
  }

  return data.user ?? null;
}

export async function resolvePostLoginRedirect(
  supabase: SupabaseClient,
  userId: string | undefined | null
): Promise<string> {
  if (!userId) return "/users/dashboard"

  const candidateColumns = ["approved_role", "requested_role", "status"] as const
  let requested = [...candidateColumns]
  let profile: Record<string, unknown> | null = null

  while (true) {
    const selection = requested.length > 0 ? requested.join(", ") : "user_id"
    const { data, error } = await supabase
      .from("profiles")
      .select(selection)
      .eq("user_id", userId)
      .maybeSingle()

    if (!error) {
      profile = data as Record<string, unknown> | null
      break
    }

    const message = error.message ?? ""
    const missing = requested.find((column) => message.includes(column))

    if (!missing) {
      console.warn("resolvePostLoginRedirect: unable to read profile role", message)
      break
    }

    requested = requested.filter((column) => column !== missing)
    if (requested.length === 0) break
  }

  const approved = profile ? normalize(profile["approved_role"]) : null
  const requestedRole = profile ? normalize(profile["requested_role"]) : null
  const status = profile ? normalize(profile["status"]) : null

  const resolvedRole = approved ?? requestedRole

  if (resolvedRole && ADMIN_DASHBOARD_ROLES.has(resolvedRole)) {
    if (resolvedRole === "club_admin" && status && status.includes("pending")) {
      return "/protected/club-admin-request"
    }
    return "/protected"
  }

  return "/users/dashboard"
}
