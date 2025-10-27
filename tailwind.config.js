// tailwind.config.js

/**
 * Tailwind CSS v4 config for SoccerConnect Admin
 *
 * Notes:
 * - Tailwind 4 auto-detects files in most cases, but we're being explicit
 *   so nothing in /src or /components gets tree-shaken.
 * - We keep the default theme (which includes `neutral` scale, rounded-xl/2xl,
 *   shadows, etc.) so all the UI classes we've been using will work.
 */

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // You can customize brand styling here later if you want:
      // colors: {
      //   brand: {
      //     50: "#eef6ff",
      //     500: "#2563eb",
      //     600: "#1e40af",
      //   },
      // },
      //
      // boxShadow: {
      //   card: "0 8px 24px rgba(0,0,0,0.06)",
      // },
      //
      // borderRadius: {
      //   xl: "0.75rem",
      //   "2xl": "1rem",
      // },
    },
  },
  plugins: [],
};
