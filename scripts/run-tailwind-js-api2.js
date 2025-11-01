const fs = require('fs')
const postcss = require('postcss')
const tailwind = require('tailwindcss')
const autoprefixer = require('autoprefixer')

async function run() {
  const inputPath = 'src/app/globals.css'
  if (!fs.existsSync(inputPath)) {
    console.error('Input CSS not found:', inputPath)
    process.exit(2)
  }
  const css = fs.readFileSync(inputPath, 'utf8')
  try {
    const config = require('../tailwind.config.cjs')
    const result = await postcss([tailwind(config), autoprefixer]).process(css, { from: inputPath })
    fs.writeFileSync('/tmp/tc2.css', result.css)
    console.log('WROTE /tmp/tc2.css; length=', result.css.length)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
