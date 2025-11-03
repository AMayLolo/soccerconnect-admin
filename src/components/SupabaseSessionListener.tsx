"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useEffect } from "react";

/**
 * Keeps Supabase session in sync with server cookies,
 * and notifies the server when auth state changes.
 * Also triggers cleanup when token refresh fails.
 */
export function SupabaseSessionListener() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      // Only send on meaningful events, to avoid spamming
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_OUT"
      ) {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session }),
        });
      }

      // If session fully died on the client, also dispatch a browser event
      // so the toast can show immediately (no navigation needed)
      if (event === "SIGNED_OUT" && !session) {
        window.dispatchEvent(new Event("session-expired"));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
