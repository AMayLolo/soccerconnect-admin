"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function SupabaseSessionListener() {
  useEffect(() => {
    const supabase = createClientComponentClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Keep Supabase session synced with Next.js cookies
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, session }),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
