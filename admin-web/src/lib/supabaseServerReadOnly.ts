import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// READ-ONLY supabase client for Server Components (no cookie writes)
export async function getSupabaseServerReadOnly() {
  const cookieStore = await cookies(); // we can read here

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // no-ops so Next.js doesn't complain about mutation
        set() {},
        remove() {},
      },
    }
  );

  return supabase;
}
