import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  // Ensure commonly used explicit heights are always generated during dev
  // so UI elements that rely on h-20 / h-32 etc. don't disappear when
  // content scanning misses a usage pattern.
  safelist: [
    'h-10',
    'h-20',
    'h-24',
    'h-32',
    'h-40',
    'h-48',
    'h-full',
    'w-48',
  ],
  plugins: [animate],
} as any as Config;

export default config;
