"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function SupabaseSessionListener() {
  useEffect(() => {
    const supabase = createClientComponentClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || (event === "SIGNED_IN" && !session)) {
        window.dispatchEvent(new Event("session-expired"));
      }

      if (["SIGNED_IN", "SIGNED_OUT", "TOKEN_REFRESHED"].includes(event)) {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session }),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
