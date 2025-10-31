// ESLint config for Next.js projects
const { defineConfig } = require('eslint/config');
const nextConfig = require('eslint-config-next');

module.exports = defineConfig([
  nextConfig,
  {
    ignores: ['dist/*'],
  },
]);
