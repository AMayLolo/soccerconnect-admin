// src/lib/getBaseUrl.ts

export function getBaseUrl() {
  // 1. Browser environment (client components)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 2. Vercel Production
  if (process.env.VERCEL_URL) {
    return `https://admin.soccerconnectusa.com`;
  }

  // 3. Vercel Preview (branch deploy)
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }

  // 4. Local Development
  return "http://localhost:3000";
}
