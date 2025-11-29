import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClientRSC() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const store = await cookies();
          return store.get(name)?.value;
        },
      },
    }
  );
}
