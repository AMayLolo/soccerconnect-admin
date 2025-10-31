// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    // ✅ Required for Next 14+ server actions
    serverActions: {
      // Allow both local dev + production host (optional)
      allowedOrigins: [
        "localhost:3000",
        "admin.soccerconnectusa.com",
      ],
    },
  },

  // ✅ This keeps Vercel happy, but we’ll handle local runs gracefully
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;
