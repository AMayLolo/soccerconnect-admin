// admin-web/src/app/page.tsx
import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RootPage() {
  // Build a Supabase server client using the new signature
  const supabase = await createSupabaseServer()

  // Check current user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If no user or there was an auth error, go to /login
  if (error || !user) {
    redirect('/login')
  }

  // If they're signed in, send them to the dashboard
  redirect('/protected')
}
