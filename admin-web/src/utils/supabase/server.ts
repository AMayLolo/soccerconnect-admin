// src/utils/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createServerClientInstance() {
  // 👇 must await cookies()
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored during SSR
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // ignored during SSR
          }
        },
      },
    }
  );

  return supabase;
}
