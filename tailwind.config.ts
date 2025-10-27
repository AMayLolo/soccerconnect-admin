// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      /* ===== Animations ===== */
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUpBlur: {
          "0%": {
            opacity: "0",
            transform: "translateY(16px)",
            filter: "blur(6px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out both",
        slideUpBlur: "slideUpBlur 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
      },

      /* ===== Colors, spacing, shadows ===== */
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#dceeff",
          500: "#2563eb",
          600: "#1e40af",
        },
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.06)",
        soft: "0 1px 4px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
