import { getSupabaseServerReadOnly } from '@/lib/supabaseServerReadOnly'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getSupabaseServerReadOnly()
    const { data, error } = await supabase
      .from('clubs')
      // `description` column was removed from the DB schema; avoid projecting it
      .select('id, club_name, city, state, logo_url, founded, competition_level')
      .order('club_name', { ascending: true })

    if (error) {
      console.error('Failed to fetch clubs list', error)

      // Retry with a smaller projection without ordering if the first query
      // failed due to network or query issues. This can help when an ordering
      // clause or large projection causes timeouts.
      try {
        const { data: fallback, error: fallbackErr } = await supabase
          .from('clubs')
          .select('id, club_name, city, state, logo_url, competition_level')

        if (!fallbackErr) {
          const resOk = NextResponse.json(fallback || [])
          resOk.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
          return resOk
        }
      } catch (e) {
        console.error('Fallback clubs list query failed', e)
      }

      const payload: any = { data: [] }
      if (process.env.NODE_ENV !== 'production') {
        payload.error = {
          message: (error as any).message ?? String(error),
          status: (error as any).status ?? null,
          details: error,
        }
      }
      const resErr = NextResponse.json(payload, { status: 500 })
      resErr.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
      return resErr
    }

    const res = NextResponse.json(data || [])
    // cache on the CDN for 60s, allow stale-while-revalidate
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res
  } catch (err) {
    console.error('Failed to fetch clubs list', err)
    const res = NextResponse.json([], { status: 500 })
    res.headers.set('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
    return res
  }
}
