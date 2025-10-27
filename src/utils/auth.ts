import { createServerClientInstance } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  try {
    const supabase = await createServerClientInstance();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn("getCurrentUser supabase.auth.getUser error:", error.message);
      return null;
    }

    if (!user) return null;
    return user;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// ✅ compatibility shim for older code that still imports requireUser
export async function requireUser() {
  return requireCurrentUser();
}
