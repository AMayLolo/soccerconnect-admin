import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabaseServerReadOnly()

    // First, get an exact total count (fast, head request) so we can always
    // return a meaningful `total` even if projections fail on older schemas.
    const { count: totalCount, error: countErr } = await supabase
      .from('clubs')
      .select('id', { head: true, count: 'exact' }) as any

    if (countErr) {
      console.error('Failed to fetch total count for clubs', countErr)
      const payload: any = { total: 0, incomplete: 0, complete: 0 }
      if (process.env.NODE_ENV !== 'production') {
        payload.error = { message: (countErr as any).message ?? String(countErr), details: countErr }
      }
      const res = NextResponse.json(payload, { status: 500 })
      res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
      return res
    }

    const total = typeof totalCount === 'number' ? totalCount : 0

    // Attempt a minimal projection to compute completeness. If the projection
    // fails (missing columns, etc.) return a safe default: mark all as
    // incomplete so admins can see items that need attention.
    try {
      const { data: rows, error } = await supabase
        .from('clubs')
        .select('id, logo_url, founded, city, state')

      if (error) {
        console.error('Projection query failed for counts', error)
        const res = NextResponse.json({ total, incomplete: total, complete: 0 })
        res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
        return res
      }

      const list = rows || []
      const incomplete = list.reduce((acc: number, r: any) => {
        const missing = !r.logo_url || r.logo_url === '' || !r.founded || r.founded === '' || !r.city || r.city === '' || !r.state || r.state === ''
        return acc + (missing ? 1 : 0)
      }, 0)
      const complete = Math.max(0, total - incomplete)
      const res = NextResponse.json({ total, incomplete, complete })
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res
    } catch (err) {
      console.error('Unexpected error computing counts', err)
      const res = NextResponse.json({ total, incomplete: total, complete: 0 })
      res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res
    }
  } catch (err) {
    console.error('Failed to fetch club counts', err)
    const payload: any = { total: 0, incomplete: 0, complete: 0 }
    if (process.env.NODE_ENV !== 'production') {
      payload.error = { message: (err as any)?.message ?? String(err), details: err }
    }
    const res = NextResponse.json(payload, { status: 500 })
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res
  }
}
