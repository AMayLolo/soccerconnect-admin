"use client"

import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser"
import { Filters as NormalizeFilters, normalizeStatsKey } from "@/utils/normalizeStatsKey"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import React, { createContext, useContext, useEffect, useRef, useState } from "react"

type Filters = NormalizeFilters

type CountsMap = Record<string, number>

type StatsContextValue = {
  register: (key: string, table: string, filters?: Filters, initial?: number) => number | undefined
  unregister: (key: string) => void
  getCount: (key: string) => number | undefined
}

const StatsContext = createContext<StatsContextValue | null>(null)

export function useSharedStats(table: string, filters?: Filters, initial?: number) {
  const key = normalizeStatsKey(table, filters)
  const ctx = useContext(StatsContext)
  if (!ctx) throw new Error("useSharedStats must be used within StatsProvider")

  // Register interest in this key on mount and unregister on unmount.
  // Registering during render was causing repeated fetches (render -> register -> setState -> render)
  // which produced many HEAD requests. Moving registration into useEffect makes it stable.
  useEffect(() => {
    ctx.register(key, table, filters, initial)
    return () => {
      try {
        ctx.unregister(key)
      } catch (e) {
        // ignore
      }
    }
    // Intentionally include only key/table/filters/initial so register is called once per subscriber
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, table])

  // current value (may be undefined until fetch completes)
  const current = ctx.getCount(key)
  const loading = current === undefined

  return { count: typeof current === "number" ? current : initial, loading }
}

export default function StatsProvider({ children, initial }: { children: React.ReactNode; initial?: CountsMap }) {
  // Defensive cookie sanitization: some auth cookies may be stored as
  // "base64-<data>" which the Supabase cookie parser expects to be JSON
  // (stringified). If a cookie value is base64-prefixed, decode it so the
  // library's parser doesn't throw when reading cookies on client init.
  if (typeof window !== "undefined") {
    try {
      const parts = document.cookie ? document.cookie.split("; ") : []
      for (const part of parts) {
        const eq = part.indexOf("=")
        if (eq === -1) continue
        const name = part.slice(0, eq)
        const value = part.slice(eq + 1)
        if (value && value.startsWith("base64-")) {
          const b64 = value.slice("base64-".length)
          try {
            // atob will throw on invalid base64; decode and set cookie to
            // the decoded JSON string so downstream parsers can JSON.parse it.
            const decoded = atob(b64)
            // replace cookie (path=/ preserves typical usage)
            document.cookie = `${name}=${encodeURIComponent(decoded)}; path=/`
            // add debug sink entry
            // cookie sanitized for downstream auth parsing
          } catch (err) {
            // ignore invalid base64 values
          }
        }
      }
    } catch (err) {
      // Defensive: don't let cookie normalization break the app
      // eslint-disable-next-line no-console
      console.warn('StatsProvider cookie sanitization failed', err)
    }
  }

  // Use a browser-global singleton to avoid creating multiple GoTrueClient
  // instances across the app (this prevents the runtime warning shown in the console).
  const supabase = typeof window !== "undefined" ? getSupabaseBrowserClient() : createClientComponentClient()
  const [counts, setCounts] = useState<CountsMap>(initial || {})

  // refs for channels and subscriber counts
  const channelsRef = useRef(new Map<string, any>())
  const subsRef = useRef(new Map<string, number>())

  // Tables we prefer to query only from the server (avoid browser counts).
  // These tables either trigger projection errors or are known to be blocked
  // by CORS in some environments; querying from the server avoids HEAD 400s.
  const SERVER_SIDE_ONLY = new Set(["profiles", "reviews"])

  // Session-scoped flag: if the browser fails to reach Supabase we set this
  // so subsequent attempts use the server fallback. Stored in sessionStorage
  // so it resets on a new tab/session.
  function isSupabaseUnavailable(): boolean {
    try {
      if (typeof window === 'undefined') return false
      return sessionStorage.getItem('supabase_unavailable') === '1'
    } catch (e) {
      return false
    }
  }

  function markSupabaseUnavailable() {
    try {
      if (typeof window !== 'undefined') sessionStorage.setItem('supabase_unavailable', '1')
    } catch (e) {
      // ignore
    }
  }

  async function fetchCount(key: string, table: string, filters?: Filters) {
    // If this table is configured to be server-side only, skip client attempts.
    if (SERVER_SIDE_ONLY.has(table)) {
      try {
        const params = new URLSearchParams()
        params.set('table', table)
        if (filters && filters.length > 0) params.set('filters', JSON.stringify(filters))
        const fallbackResp = await fetch(`/api/counts?${params.toString()}`, { method: 'GET', credentials: 'same-origin' })
        if (fallbackResp && fallbackResp.ok) {
          const payload = await fallbackResp.json()
          if (payload && typeof payload.total === 'number') {
            setCounts((prev) => ({ ...prev, [key]: payload.total }))
            // server-only returned total
            return payload.total
          }
        }
      } catch (e) {
  // server-only fallback failed
      }
      return undefined
    }
    // If there is no Supabase auth cookie present in the browser, skip trying
    // a client-side HEAD/count request (these fail under some network/CORS
    // conditions) and immediately use the same-origin server fallback.
    if (typeof window !== 'undefined') {
      try {
        const cookie = document.cookie || ''
        const hasAuth = /supabase|sb:|sb\-|supabase-auth-token/i.test(cookie)
        if (!hasAuth) {
          // no auth cookies found; using server fallback
          // call the same fallback path used below
          const params = new URLSearchParams()
          params.set('table', table)
          if (filters && filters.length > 0) params.set('filters', JSON.stringify(filters))
          try {
            const fallbackResp = await fetch(`/api/counts?${params.toString()}`, { method: 'GET', credentials: 'same-origin' })
            if (fallbackResp && fallbackResp.ok) {
              const payload = await fallbackResp.json()
              if (payload && typeof payload.total === 'number') {
                setCounts((prev) => ({ ...prev, [key]: payload.total }))
                // server fallback returned total
                return payload.total
              }
            }
          } catch (e) {
            // server fallback failed in auth-check path
          }
          return undefined
        }
      } catch (e) {
        // if cookie parsing fails, fall through to normal client flow
      }
    }
    try {
  // fetchCount start

      // If we've previously detected Supabase is unreachable for this session,
      // skip the client attempt and go straight to the server fallback.
      if (typeof window !== 'undefined' && isSupabaseUnavailable()) {
  // supabase marked unavailable; skipping client head
        const params = new URLSearchParams()
        params.set('table', table)
        if (filters && filters.length > 0) params.set('filters', JSON.stringify(filters))
        try {
          const fallbackResp = await fetch(`/api/counts?${params.toString()}`, { method: 'GET', credentials: 'same-origin' })
          if (fallbackResp && fallbackResp.ok) {
            const payload = await fallbackResp.json()
            if (payload && typeof payload.total === 'number') {
              setCounts((prev) => ({ ...prev, [key]: payload.total }))
              // server fallback returned total
              return payload.total
            }
          }
        } catch (e) {
          // server fallback failed in skip path
        }
        return undefined
      }

      let q: any = supabase.from(table).select("id", { head: true, count: "exact" })
      if (filters && filters.length > 0) {
        for (const f of filters) {
          if (f.op === "eq") q = q.eq(f.column, f.value)
          else if (f.op === "is") q = q.is(f.column, f.value)
          else if (f.op === "neq") q = q.neq(f.column, f.value)
        }
      }
      let res: any
      try {
        res = await q
      } catch (e) {
        // network or runtime failure - mark supabase unavailable for this session
  // client head threw; marking supabase unavailable
        markSupabaseUnavailable()
        res = { error: { message: String(e), status: 0 } }
      }

      // Only update state when query succeeded and returned a numeric count.
      if (res && !res.error && typeof res.count === "number") {
        setCounts((prev) => ({ ...prev, [key]: res.count }))
        return res.count
      }

      // If we reached here there was an error or count was unavailable.
      if (res && res.error) {
        const info = {
          key,
          table,
          filters: filters || undefined,
          status: (res.error as any).status ?? undefined,
          message: (res.error as any).message ?? undefined,
          details: res,
        }
  // fetchCount failed
        if ((res.error as any).status && (res.error as any).status >= 400) {
          markSupabaseUnavailable()
        }
      }

        // Try a same-origin server fallback so the UI can stay responsive even
        // when browser->Supabase requests are blocked by CORS or networking issues.
        try {
      // starting server fallback

          const params = new URLSearchParams()
          params.set('table', table)
          if (filters && filters.length > 0) params.set('filters', JSON.stringify(filters))
          const fallbackResp = await fetch(`/api/counts?${params.toString()}`, { method: 'GET', credentials: 'same-origin' })
          if (fallbackResp && fallbackResp.ok) {
            const payload = await fallbackResp.json()
            // When called for the top-level table we map `total` into the key.
            if (payload && typeof payload.total === 'number') {
              setCounts((prev) => ({ ...prev, [key]: payload.total }))
              // server fallback returned total
              return payload.total
            }
          }
        } catch (e) {
          // fallback to server counts failed
        }

        return undefined

    } catch (err) {
      // Network or unexpected error. Keep this as an error so it's visible for debugging,
      // but include the key/table for context.
      console.error("StatsProvider fetchCount error", { key, table, filters, err })
      return undefined
    }
  }

  function ensureSubscription(key: string, table: string, filters?: Filters) {
    // If already subscribed, do nothing
    if (channelsRef.current.has(key)) return
    // If Supabase is marked unavailable for this session, skip realtime
    // subscription attempts to avoid WebSocket errors in the console.
    if (typeof window !== 'undefined' && isSupabaseUnavailable()) {
  // skipping subscription because supabase is unavailable
      return
    }
    try {
      const channel = supabase
        .channel(`${key}-changes`)
        .on("postgres_changes", { event: "*", schema: "public", table }, async (payload: any) => {
          // On any change for the table, re-fetch count for this key
          await fetchCount(key, table, filters)
        })
        .subscribe()

      channelsRef.current.set(key, channel)
    } catch (err) {
      // If subscription fails, rely on polling (handled elsewhere)
      console.warn("StatsProvider: realtime subscription failed", err)
    }
  }

  function removeSubscription(key: string) {
    const channel = channelsRef.current.get(key)
    if (!channel) return
    try {
      channel.unsubscribe()
    } catch (err) {
      // ignore
    }
    channelsRef.current.delete(key)
  }

  function register(key: string, table: string, filters?: Filters, initial?: number) {
    // increase subscriber count
    const prev = subsRef.current.get(key) ?? 0
    subsRef.current.set(key, prev + 1)

    // prime initial value if provided and no value exists
    if (initial !== undefined && counts[key] === undefined) {
      setCounts((prevMap) => ({ ...prevMap, [key]: initial }))
    }

  // registration

    // ensure we have a subscription
    ensureSubscription(key, table, filters)

    // immediately fetch to ensure freshness
    fetchCount(key, table, filters)

    return counts[key]
  }

  function unregister(key: string) {
    const prev = subsRef.current.get(key) ?? 0
    if (prev <= 1) {
      subsRef.current.delete(key)
      removeSubscription(key)
    } else {
      subsRef.current.set(key, prev - 1)
    }
  // unregister
  }

  useEffect(() => {
    // cleanup on unmount
    return () => {
      // unsubscribe all
      for (const [k, ch] of channelsRef.current.entries()) {
        try {
          ch.unsubscribe()
        } catch (err) {
          // ignore
        }
      }
      channelsRef.current.clear()
      subsRef.current.clear()
    }
  }, [])

  const value: StatsContextValue = {
    register: (key: string, table: string, filters?: Filters, initial?: number) => register(key, table, filters, initial),
    unregister: (key: string) => unregister(key),
    getCount: (key: string) => counts[key],
  }

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}
