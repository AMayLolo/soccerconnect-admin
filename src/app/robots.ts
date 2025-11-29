// robots.ts (Next.js App Router)
// Generates robots.txt instructions. Adjust allow/disallow as public surface grows.
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/protected"], // prevent indexing of authenticated app surface
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
