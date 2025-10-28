// src/utils/supabase/serverAdmin.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase admin client (bypasses RLS).
 * ⚠️ Use only for secure server-side actions or routes.
 */
export async function createServerAdminClientInstance() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => Array.from(cookieStore.getAll()),
        setAll: () => {}, // no cookie mutation in admin context
      },
    }
  );

  return supabase;
}
