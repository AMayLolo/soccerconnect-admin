// svgo.config.cjs - conservative config compatible with svgo v4+
module.exports = {
  multipass: false,
  js2svg: { pretty: false, indent: 2 },
  plugins: [
    // Use preset-default and override only a few behaviors to be conservative.
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox so scaling stays correct
          removeViewBox: false,

          // Limit path-data precision to avoid visual changes
          convertPathData: { floatPrecision: 3 },

          // Don't convert colors to currentColor by default
          convertColors: { currentColor: false }
        }
      }
    },

    // Safe, explicit plugins (these are additive to preset-default)
    'removeMetadata',
    'removeComments',
    'removeTitle',
    'removeDesc',
    'removeUselessDefs',
    'removeEmptyAttrs',
    'removeEmptyText',
    'removeHiddenElems',
    'mergePaths',
    'collapseGroups',
    'sortAttrs'
  ]
}