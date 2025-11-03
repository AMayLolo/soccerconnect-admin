import { createServerClientInstance } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("getCurrentUser failed:", error.message);
    return null;
  }

  return data.user ?? null;
}
