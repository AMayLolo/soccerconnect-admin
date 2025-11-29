import { createBrowserClient } from "@supabase/ssr"

// Returns a single Supabase client instance attached to window to avoid
// creating multiple GoTrueClient instances in the same browser context.
// This helper is safe to import from server code because it does not throw
// at import time; it will return a proxy when called on the server so that
// accidental server-side calls produce a clear runtime error only when used.
export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    // During server render return a safe proxy instead of throwing here.
    // The proxy will only throw if a method is actually invoked at runtime
    // on the server. This prevents build/runtime failures when modules
    // import this helper but only call it from client code.
    const thrower = () => {
      throw new Error(
        'getSupabaseBrowserClient was used during server render. Call this helper only from client components or inside client-side effects.'
      )
    }

    const methodHandler: ProxyHandler<any> = {
      apply() {
        thrower()
      },
      get() {
        return thrower
      },
    }

    const handler: ProxyHandler<any> = {
      get() {
        // Return a callable proxy so nested accesses (e.g. supabase.auth.signOut)
        // don't throw on property access but will throw when invoked.
        return new Proxy(thrower, methodHandler)
      },
      apply() {
        thrower()
      },
    }

    return new Proxy({}, handler) as any
  }

  // store on window to keep a single instance across module reloads/HMR
  const w = window as any
  if (!w.__supabase_browser_client) {
    w.__supabase_browser_client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return w.__supabase_browser_client
}
