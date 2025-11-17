// src/env.mjs
import { z } from "zod";
import { getBaseUrl } from "@/lib/getBaseUrl";


// ----------------------------------------
// PUBLIC environment variables (browser)
// ----------------------------------------
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_SUPABASE_LOGO_BUCKET: z.string(),

  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_DOMAIN: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// ----------------------------------------
// PRIVATE environment variables (server only)
// ----------------------------------------
const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

// ----------------------------------------
// Merge & load
// ----------------------------------------
const merged = publicSchema.merge(serverSchema);

// Validate
const parsed = merged.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_LOGO_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_LOGO_BUCKET,

  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables — see console.");
}

export const env = parsed.data;
export const BASE_URL = getBaseUrl();
