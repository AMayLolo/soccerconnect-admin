const fs = require('fs')
const postcss = require('postcss')
const tailwindPlugin = require('@tailwindcss/postcss')
const autoprefixer = require('autoprefixer')

async function run() {
  const inputPath = 'src/app/globals.css'
  if (!fs.existsSync(inputPath)) {
    console.error('Input CSS not found:', inputPath)
    process.exit(2)
  }
  const css = fs.readFileSync(inputPath, 'utf8')
  try {
    const result = await postcss([tailwindPlugin(require('../tailwind.config.cjs')), autoprefixer]).process(css, { from: inputPath })
    fs.writeFileSync('/tmp/tc.css', result.css)
    console.log('WROTE /tmp/tc.css; length=', result.css.length)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
