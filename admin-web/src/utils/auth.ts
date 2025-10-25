import { createSupabaseServer } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServer(); // 👈 updated to match the export

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getCurrentUser error:", error.message);
    return null;
  }

  return user;
}
