import { createServerClient } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerClient(); // 👈 await since it's now async

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
