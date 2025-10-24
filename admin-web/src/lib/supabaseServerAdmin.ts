// admin-web/src/lib/supabaseServerAdmin.ts
// this is just like your getSupabaseServerReadOnly but without restricting the client.
// we assume anon key can update `review_reports.resolved`
// if you eventually lock writes behind service_role, you would swap in service key here.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerAdmin() {
  // grab cookie store on each call (fresh per request)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // or SERVICE_ROLE if you want stricter control
    {
      cookies: {
        get(name: string) {
          // read-only, fine
          return cookieStore.get(name)?.value;
        },
        set() {
          // don't mutate cookies in these server actions
        },
        remove() {
          // don't mutate cookies in these server actions
        },
      },
    }
  );

  return supabase;
}
