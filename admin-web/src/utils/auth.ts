// src/utils/auth.ts
import { createServerClientInstance } from "@/utils/supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();

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
