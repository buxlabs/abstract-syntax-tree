const { readFileSync } = require('fs')
const { join } = require('path')

function readFile (path) {
  return readFileSync(join(__dirname, path), 'utf8')
}

module.exports = {
  en: [
    readFile('/en/001-getting-started.md')
  ],
  pl: [
    readFile('/pl/001-zaczynamy.md')
  ]
}
