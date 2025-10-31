import { createServerClientInstance } from "./supabase/server";

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();

  // Primary check
  let { data, error } = await supabase.auth.getUser();

  // Attempt refresh if needed
  if (error || !data?.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) return null;
    data = { user: sessionData.session.user };
  }

  return data.user;
}
