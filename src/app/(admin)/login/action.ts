"use server";
import { createClientServer } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = createClientServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  return { data, error };
}
