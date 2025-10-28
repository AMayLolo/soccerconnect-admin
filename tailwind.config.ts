import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // ✅ all code inside /src
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0C4A6E", // dark blue (your admin accent)
        accent: "#3B82F6",  // light blue
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

export default config;
