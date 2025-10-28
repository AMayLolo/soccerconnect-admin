// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},   // ✅ required for Tailwind 4 + Turbopack
    autoprefixer: {},
  },
};
