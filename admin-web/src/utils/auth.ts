import { createSupabaseServerClient } from "./supabase/server";

/**
 * ✅ Fetches the currently logged-in Supabase user
 * Uses async Edge-runtime compatible cookies + SSR client
 */
export async function getCurrentUser() {
  try {
    // Create the Supabase client
    const supabase = await createSupabaseServerClient();

    // Get the user data from the current session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle auth error
    if (error) {
      console.error("❌ getCurrentUser error:", error.message);
      return null;
    }

    return user;
  } catch (err: any) {
    console.error("❌ Unexpected getCurrentUser failure:", err);
    return null;
  }
}
