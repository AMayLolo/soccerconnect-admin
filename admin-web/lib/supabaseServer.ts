import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Next 16: cookies() is async; provide async cookie adapter
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => cookieStore.get(name)?.value,
        set: async (name: string, value: string, options: CookieOptions) => {
          await cookieStore.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          await cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
