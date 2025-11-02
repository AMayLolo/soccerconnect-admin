"use client";

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

// Return the browser client when called from client code. Export a getter
// function instead of a top-level instance to avoid calling the browser
// helper during module evaluation in server contexts.
export function getSupabaseClient() {
	return getSupabaseBrowserClient()
}
