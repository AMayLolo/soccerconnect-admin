// Re-export the CommonJS config so the cjs file is authoritative.
// This avoids having two divergent configs while keeping a TS entry
// for any tools that expect it.
/* eslint-disable @typescript-eslint/no-var-requires */
const config = require('./tailwind.config.cjs');
export default config;
