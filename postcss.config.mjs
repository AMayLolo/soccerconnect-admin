// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // ✅ new plugin name
    autoprefixer: {},
  },
};

export default config;
