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

// Node resolves packages to their real path, so every id is canonicalized the
// same way. Without it the same file reached through a symlink and through a
// relative path would be two different modules and get bundled twice.
function real (id) {
  try {
    return fs.realpathSync(id)
  } catch (error) {
    return id
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

function bare (specifier) {
  return !specifier.startsWith('.') && !path.isAbsolute(specifier)
}

// Node's own algorithm, so package walking, main, exports maps, subpaths and
// scoped names all behave the way they do everywhere else.
function installed (specifier, importer) {
  try {
    return require.resolve(specifier, { paths: [path.dirname(path.resolve(importer))] })
  } catch (error) {
    return undefined
  }
}

// Resolves against the importer's directory, so nothing depends on the working
// directory. A relative specifier that matches no file is left unresolved,
// which graph and bundle then report as missing.
//
// A bare specifier names a package. By default it stays an import, the way it
// does in every other bundler; pass { packages: true } to read it out of
// node_modules and pull it into the bundle instead.
function resolver ({ packages = false } = {}) {
  return function resolve (specifier, importer) {
    if (bare(specifier)) {
      if (!packages) return null
      if (specifier.startsWith('node:')) return null
      const id = installed(specifier, importer)
      return id === undefined ? undefined : real(id)
    }
    const base = path.resolve(path.dirname(importer), specifier)
    for (const candidate of candidates(base)) {
      if (file(candidate)) return real(candidate)
    }
    return undefined
  }
}

module.exports = { modules, resolve: resolver(), resolver }
