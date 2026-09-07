const fs = require('node:fs')
const path = require('node:path')

const EXTENSIONS = ['', '.js', '.mjs']
const INDEXES = ['index.js', 'index.mjs']

function file (id) {
  try {
    return fs.statSync(id).isFile()
  } catch (error) {
    return false
  }
}

function candidates (id) {
  const result = []
  for (const extension of EXTENSIONS) result.push(id + extension)
  for (const index of INDEXES) result.push(path.join(id, index))
  return result
}

// Reads a module. Anything unreadable is undefined rather than an error,
// because a module id is only a candidate until it resolves.
function modules (id) {
  try {
    return fs.readFileSync(id, 'utf8')
  } catch (error) {
    return undefined
  }
}

// Resolves against the importer's directory, so nothing depends on the working
// directory. A bare specifier names a package and stays an import; a relative
// specifier that matches no file is left unresolved, which graph and bundle
// then report as missing.
function resolve (specifier, importer) {
  if (!specifier.startsWith('.') && !path.isAbsolute(specifier)) return null
  const base = path.resolve(path.dirname(importer), specifier)
  for (const candidate of candidates(base)) {
    if (file(candidate)) return candidate
  }
  return undefined
}

module.exports = { modules, resolve }
