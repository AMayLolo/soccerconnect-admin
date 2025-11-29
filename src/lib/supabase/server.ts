import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClientServer() {
  const store = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return store.get(name)?.value;
        },
        set(name, value, options) {
          store.set(name, value, options);
        },
        remove(name, options) {
          store.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
