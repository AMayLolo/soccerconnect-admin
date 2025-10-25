import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Explicitly load the .env file in this folder
dotenv.config({ path: ".env" });

// DEBUG LOGS - TEMPORARY
console.log("[DEBUG] SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("[DEBUG] SUPABASE_SERVICE_KEY defined?:", !!process.env.SUPABASE_SERVICE_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is missing. Check your .env file.");
}
if (!SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is missing. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
});
