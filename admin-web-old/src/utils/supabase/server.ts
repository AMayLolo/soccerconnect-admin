// utils/supabase/server.ts
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function createServerClientInstance() {
  const cookieStore = cookies();

  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error("Missing Supabase env vars on server");
  }

  // service-role client (full DB access, RLS bypass)
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      persistSession: false,
    },
  });

  // if user tokens exist, optionally verify the user profile
  if (accessToken) {
    const { data: { user }, error } = await adminClient.auth.getUser(accessToken);

    if (!error && user) {
      return adminClient;
    }
  }

  return adminClient;
}
