// src/env.mjs
import { z } from "zod";
import { getBaseUrl } from "@/lib/getBaseUrl";


// ----------------------------------------
// PUBLIC environment variables (browser)
// ----------------------------------------
// Make non-critical public vars optional with sane defaults so build doesn't fail
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_SUPABASE_LOGO_BUCKET: z.string().default("logos"),

  NEXT_PUBLIC_SITE_URL: z.string().url().optional(), // canonical marketing domain (www)
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(), // legacy / interchangeable
  NEXT_PUBLIC_DOMAIN: z.string().optional(), // root apex or custom usage
  NEXT_PUBLIC_APP_URL: z.string().url().optional(), // admin app domain (admin.)
});

// ----------------------------------------
// PRIVATE environment variables (server only)
// ----------------------------------------
// Server-only vars. Service role required only if admin tasks/storage writes needed in this build.
const serverSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
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
  // Only show truly required missing variables (Supabase creds)
  const formatted = parsed.error.format();
  const requiredIssues = {
    NEXT_PUBLIC_SUPABASE_URL: formatted?.NEXT_PUBLIC_SUPABASE_URL?._errors,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: formatted?.NEXT_PUBLIC_SUPABASE_ANON_KEY?._errors,
  };
  console.error("❌ Invalid required environment variables:", requiredIssues);
  throw new Error("Missing required Supabase environment variables.");
}

const raw = parsed.data;

// Derive deployment URL fallbacks
const vercelURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
const SITE_URL = raw.NEXT_PUBLIC_SITE_URL || raw.NEXT_PUBLIC_BASE_URL || vercelURL || "http://localhost:3000";
const APP_URL = raw.NEXT_PUBLIC_APP_URL || SITE_URL; // fallback admin domain
const DOMAIN = raw.NEXT_PUBLIC_DOMAIN || new URL(SITE_URL).hostname;

// Ensure SUPABASE_URL fallback if server-only not provided
const SUPABASE_URL = raw.SUPABASE_URL || raw.NEXT_PUBLIC_SUPABASE_URL;

export const env = {
  ...raw,
  NEXT_PUBLIC_SITE_URL: SITE_URL,
  NEXT_PUBLIC_BASE_URL: SITE_URL,
  NEXT_PUBLIC_APP_URL: APP_URL,
  NEXT_PUBLIC_DOMAIN: DOMAIN,
  SUPABASE_URL,
};

export const BASE_URL = getBaseUrl();
export const CANONICAL_SITE_URL = SITE_URL;
export const ADMIN_APP_URL = APP_URL;
