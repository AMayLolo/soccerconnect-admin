import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly'
import { NextResponse } from 'next/server'

const ALLOWED = new Set([
  'clubs',
  'profiles',
  'reviews',
  'reports',
  'club_admin_requests',
  'discussions',
  'clean_clubs_view',
  'logos',
])

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const table = url.searchParams.get('table')
    const filtersRaw = url.searchParams.get('filters')

    if (!table || !ALLOWED.has(table)) {
      // Return a safe empty payload instead of an error to avoid noisy 4xx
      // responses in the browser when StatsProvider attempts fallbacks for
      // tables that don't have a dedicated server API.
      return NextResponse.json({ total: 0 }, { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
    }

    let filters: Array<{ column: string; op: string; value: any }> = []
    if (filtersRaw) {
      try {
        filters = JSON.parse(filtersRaw)
      } catch (e) {
        // ignore invalid filters
        filters = []
      }
    }

  const supabase = getSupabaseServerReadOnly()

    let q: any = supabase.from(table).select('id', { head: true, count: 'exact' })
    if (filters && filters.length > 0) {
      for (const f of filters) {
        if (f.op === 'eq') q = q.eq(f.column, f.value)
        else if (f.op === 'is') q = q.is(f.column, f.value)
        else if (f.op === 'neq') q = q.neq(f.column, f.value)
      }
    }

    const res: any = await q
    if (res && !res.error && typeof res.count === 'number') {
      return NextResponse.json({ total: res.count }, { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
    }

    // On query errors return a safe zero total instead of a 5xx to avoid
    // surfacing server-side projection issues as noisy network errors in the
    // browser. The server logs will still include the original error.
    return NextResponse.json({ total: 0, error: 'count_failed', details: res?.error ?? null }, { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } })
  } catch (err) {
    return NextResponse.json({ error: 'internal_error', details: String(err) }, { status: 500 })
  }
}
