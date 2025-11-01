const animate = require('tailwindcss-animate');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  // Mirror the safelist from the TS config so Turbopack/Next dev picks it up.
  // Use a regex pattern for heights so Tailwind will always emit the
  // common `h-*` utilities we rely on, regardless of content scanning quirks.
  safelist: [
    {
      pattern: /^h-(?:10|12|16|20|24|32|40|48)$/,
    },
    'h-full',
    'w-48',
  ],
  plugins: [animate],
};
