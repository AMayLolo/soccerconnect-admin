// admin-web/src/lib/supabaseServer.ts
import 'server-only';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// simple fetch wrapper to Supabase REST
export async function sb<T = any>(
  path: string,
  init?: RequestInit
): Promise<{ data: T | null; error: any }> {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let err: any = null;
    try { err = await res.json(); } catch { err = await res.text(); }
    return { data: null, error: err };
  }
  try {
    const json = (await res.json()) as T;
    return { data: json, error: null };
  } catch {
    return { data: null, error: null };
  }
}
