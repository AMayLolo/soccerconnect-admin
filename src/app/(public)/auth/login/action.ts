"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    }
  );

  // authenticate user
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // return error message to the form if wanted
    return { error: error.message };
  }

  const userId = authData.user.id;

  // get the user role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  const role = profile?.role ?? "user";

  // redirect based on role
  if (role === "admin") {
    redirect("/protected/dashboard");
  }

  redirect("/clubs");
}
