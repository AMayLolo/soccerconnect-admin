"use server";
import { createClientServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const supabase = await createClientServer();

  const { data, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    throw new Error(error.message);
  }

  const redirectTo = (formData.get("redirect") as string) || "/protected";
  // After signup, send user to login and preserve redirect intent
  redirect(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
}
