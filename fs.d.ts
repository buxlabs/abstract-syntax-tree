export type ModuleLoader = (id: string) => string | undefined
export type Resolver = (specifier: string, importer: string) => string | null | undefined

export interface ResolverOptions {
  /**
   * Whether a bare specifier is read out of node_modules and pulled into the
   * bundle. False by default, which leaves it as an import. Node builtins stay
   * external either way.
   */
  packages?: boolean
}

/**
 * Reads a module from disk. Returns undefined when the id is not a readable
 * file, which is what makes it usable as a resolution candidate.
 */
export declare const modules: ModuleLoader

/**
 * Resolves a specifier against the importer's directory, trying no extension,
 * .js, .mjs and a directory index. Returns null for a bare specifier, which
 * leaves it as an import, and undefined when nothing matches, which graph and
 * bundle report as a missing module. Resolved ids are canonical paths.
 */
export declare const resolve: Resolver

/**
 * Builds a resolver. Pass { packages: true } to resolve bare specifiers out of
 * node_modules with Node's own algorithm, so main, exports maps, subpaths and
 * scoped names all behave as they do elsewhere.
 */
export declare function resolver (options?: ResolverOptions): Resolver
