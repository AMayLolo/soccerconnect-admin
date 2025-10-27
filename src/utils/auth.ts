// src/utils/auth.ts
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/utils/supabase/server";

/**
 * Get the currently authenticated Supabase user on the server.
 * Returns the user object or null.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerClientInstance();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn(
        "getCurrentUser supabase.auth.getUser error:",
        error.message
      );
      return null;
    }

    if (!user) return null;
    return user;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

/**
 * Require a logged-in user.
 * - If not logged in, redirect("/login") which stops rendering on the server.
 * - If logged in, returns the user.
 */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Backwards compatibility alias.
 * Older code imports { requireUser } from "@/utils/auth".
 * We'll keep that working by forwarding to requireCurrentUser().
 */
export async function requireUser() {
  return requireCurrentUser();
}
