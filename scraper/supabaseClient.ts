import { createClient } from "@supabase/supabase-js";

/**
 * Universal Supabase client:
 * - Works inside Next.js (uses built-in env loader)
 * - Works in standalone Node scripts (loads dotenv)
 */

function loadEnvIfNeeded() {
  // ✅ If running outside Next.js, load .env manually
  const isNext = !!process.env.NEXT_RUNTIME || !!process.env.__NEXT_PROCESSED_ENV;
  if (!isNext && process.env.NODE_ENV !== "production") {
    try {
      const dotenv = require("dotenv");
      dotenv.config({ path: ".env" });
      console.log("[ENV] Loaded .env file for standalone scraper mode");
    } catch {
      console.warn("[ENV] dotenv not found — assuming env already provided");
    }
  }
}

// ✅ Load envs when needed
loadEnvIfNeeded();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  throw new Error("❌ Missing SUPABASE_URL. Check .env or Vercel environment.");
}
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("❌ Missing SUPABASE_SERVICE_KEY. Check .env or Vercel environment.");
}

// ✅ Create Supabase client (works in both Next.js + CLI contexts)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});
