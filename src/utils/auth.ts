import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ✅ Safe factory to use in layouts, pages, and route handlers
export async function createServerClientInstance() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch {
            return [];
          }
        },
        setAll() {
          // ✅ Intentionally left empty — Next.js 16 disallows direct modification here
          // Only route handlers (like /api/auth or /logout) are allowed to mutate cookies
        },
      },
    }
  );

  return supabase;
}

// ✅ Helper to get the logged-in user safely
export async function getCurrentUser() {
  const supabase = await createServerClientInstance();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[getCurrentUser] Supabase error:", error.message);
  }

  return data?.user || null;
}
