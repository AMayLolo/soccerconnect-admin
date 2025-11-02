import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Returns a single Supabase client instance attached to window to avoid
// creating multiple GoTrueClient instances in the same browser context.
// This helper is safe to import from server code because it does not throw
// at import time; it will return a proxy when called on the server so that
// accidental server-side calls produce a clear runtime error only when used.
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    // Return a proxy that throws on first property access to provide a
    // clearer error when someone mistakenly calls this during SSR.
    const handler: ProxyHandler<any> = {
      get() {
        throw new Error("getSupabaseBrowserClient was called during server render — call it from a client component or inside useEffect on the client.")
      },
      apply() {
        throw new Error("getSupabaseBrowserClient was called during server render — call it from a client component or inside useEffect on the client.")
      },
    }
    return new Proxy({}, handler) as any
  }

  // store on window to keep a single instance across module reloads/HMR
  const w = window as any
  if (!w.__supabase_browser_client) {
    w.__supabase_browser_client = createClientComponentClient()
  }
  return w.__supabase_browser_client
}
