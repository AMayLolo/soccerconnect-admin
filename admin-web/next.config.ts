// admin-web/next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbopack: {
      // make Turbopack treat this folder as the root
      root: __dirname,
    },
  },
};

export default nextConfig;