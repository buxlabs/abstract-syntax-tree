export type ModuleLoader = (id: string) => string | undefined
export type Resolver = (specifier: string, importer: string) => string | null | undefined

/**
 * Reads a module from disk. Returns undefined when the id is not a readable
 * file, which is what makes it usable as a resolution candidate.
 */
export declare const modules: ModuleLoader

/**
 * Resolves a specifier against the importer's directory, trying no extension,
 * .js, .mjs and a directory index. Returns null for a bare specifier, which
 * leaves it as an import, and undefined when nothing matches, which graph and
 * bundle report as a missing module.
 */
export declare const resolve: Resolver
