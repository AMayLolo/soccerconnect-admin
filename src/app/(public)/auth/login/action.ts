"use server";
import { createClientServer } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = createClientServer();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  return await supabase.auth.signInWithPassword({ email, password });
}
