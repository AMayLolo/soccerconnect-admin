// postcss.config.js
/**
 * PostCSS configuration for Tailwind CSS v4
 * -----------------------------------------
 * - Tailwind 4 no longer uses separate `@tailwind` directives in CSS files.
 * - It’s powered via this PostCSS plugin instead.
 * - No need to include `autoprefixer` manually (it’s built-in).
 */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
