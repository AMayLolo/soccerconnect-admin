import { NextResponse } from "next/server";
import { env, CANONICAL_SITE_URL, ADMIN_APP_URL } from "@/env.mjs";

// Redact sensitive keys
function redact(value?: string) {
  if (!value) return undefined;
  if (value.length <= 8) return value; // short values
  return value.slice(0, 4) + "…" + value.slice(-4);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    site: CANONICAL_SITE_URL,
    adminApp: ADMIN_APP_URL,
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyPresent: !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRolePresent: !!env.SUPABASE_SERVICE_ROLE_KEY,
      logoBucket: env.NEXT_PUBLIC_SUPABASE_LOGO_BUCKET,
    },
    derived: {
      domain: env.NEXT_PUBLIC_DOMAIN,
    },
    raw: {
      NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    },
    // Provide a redacted service role value for debugging presence
    debugRedacted: {
      SUPABASE_SERVICE_ROLE_KEY: redact(env.SUPABASE_SERVICE_ROLE_KEY),
    },
  });
}
