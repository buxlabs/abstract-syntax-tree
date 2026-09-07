const RELATIVE = /^\.\.?\//
const ABSOLUTE = /^\//
const SCHEME = /^[a-zA-Z][a-zA-Z\d+\-.]*:/

const EXTENSIONS = ['', '.js', '.mjs']

function dirname (id) {
  const index = id.lastIndexOf('/')
  return index === -1 ? '' : id.slice(0, index)
}

// Pure string path handling. The package never touches the filesystem, so a
// module id is only ever a key into the caller's map.
function normalize (path) {
  const absolute = ABSOLUTE.test(path)
  const parts = []
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue
    if (part === '..' && parts.length && parts[parts.length - 1] !== '..') {
      parts.pop()
    } else {
      parts.push(part)
    }
  }
  return (absolute ? '/' : '') + parts.join('/')
}

function candidates (specifier, importer) {
  const base = dirname(importer)
  const joined = base ? normalize(base + '/' + specifier) : normalize(specifier)
  const paths = joined === specifier ? [specifier] : [specifier, joined]
  const result = []
  for (const path of paths) {
    for (const extension of EXTENSIONS) result.push(path + extension)
    for (const extension of EXTENSIONS) result.push(path + '/index' + extension)
  }
  return result
}

function external (specifier, importer, options) {
  const value = options.external
  if (!value) return false
  if (Array.isArray(value)) return value.includes(specifier)
  if (value instanceof RegExp) return value.test(specifier)
  if (typeof value === 'function') return Boolean(value(specifier, importer))
  return false
}

module.exports = function resolve (specifier, importer, options, has) {
  if (external(specifier, importer, options)) return { external: true }

  if (typeof options.resolve === 'function') {
    const id = options.resolve(specifier, importer)
    // null is a deliberate "leave this as an import"; undefined means the
    // resolver did not find it, which is reported as missing rather than
    // quietly turned into an external.
    if (id === null) return { external: true }
    if (id === undefined) return { missing: true }
    return { id }
  }

  // An exact key wins before anything else, so a flat map keyed by the
  // specifiers themselves works without any path handling at all.
  if (has(specifier)) return { id: specifier }

  // A bare specifier names a package rather than a file in the map, so with
  // nothing to resolve it against it stays an import in the output.
  if (!RELATIVE.test(specifier) && !ABSOLUTE.test(specifier) && !SCHEME.test(specifier)) {
    return { external: true }
  }
  if (SCHEME.test(specifier)) return { external: true }

  for (const candidate of candidates(specifier, importer)) {
    if (has(candidate)) return { id: candidate }
  }
  return { missing: true }
}

module.exports.normalize = normalize
module.exports.dirname = dirname
