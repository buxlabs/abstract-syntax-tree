# abstract-syntax-tree

[![npm](https://img.shields.io/npm/v/abstract-syntax-tree.svg)](https://www.npmjs.com/package/abstract-syntax-tree) [![build](https://github.com/buxlabs/abstract-syntax-tree/workflows/build/badge.svg)](https://github.com/buxlabs/abstract-syntax-tree/actions)

🧰 A library for working with abstract syntax trees.

### Key features

- [parse](#parse), [transform](#replace) and [generate](#generate) code with a single dependency
- offers both [functional](#functional-programming-style) and [class](#object-oriented-programming-style) interfaces
- built-in ast <-> js types helpers - [serialize](#serialize) and [template](#template)
- built-in [find](#find), [has](#has), [scope](#scope) analysis, [rename](#rename), [prune](#prune), [graph](#graph) and [bundle](#bundle)
- reads [CommonJS](#commonjs) as well as modules, and no filesystem access unless you opt in with [abstract-syntax-tree/fs](#reading-from-disk)
- built-in transformations like [append](#append), [prepend](#prepend)
- 25+ methods total

## Table of Contents

- [Background](#background)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Nodes](#nodes)
- [Optimizations](#optimizations)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

An abstract syntax tree is a way to represent the source code. In case of this library it is represented in the [estree](https://github.com/estree/estree) format.

For example, the following source code:

```js
const answer = 42
```

Has the following representation:

```json
{
  "type": "Program",
  "body": [
    {
      "type": "VariableDeclaration",
      "declarations": [
        {
          "type": "VariableDeclarator",
          "id": {
            "type": "Identifier",
            "name": "answer"
          },
          "init": {
            "type": "Literal",
            "value": 42
          }
        }
      ],
      "kind": "const"
    }
  ]
}
```

The goal of this library is to consolidate common abstract syntax tree operations in one place. It uses a variety of libraries under the hood based on their performance and flexibility, e.g. [meriyah](https://github.com/meriyah/meriyah) for parsing and [astring](https://github.com/davidbonnet/astring) for source code generation.

The library exposes a set of utility methods that can be useful for analysis or transformation of abstract syntax trees. It supports functional and object-oriented programming style.

## Installation

```bash
npm install abstract-syntax-tree
```

## Usage

### Functional programming style

```js
const { parse, find } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(find(tree, "Literal")) // [ { type: 'Literal', value: 42 } ]
```

### Object oriented programming style

```js
const AbstractSyntaxTree = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = new AbstractSyntaxTree(source)
console.log(tree.find("Literal")) // [ { type: 'Literal', value: 42 } ]
```

## API

### Static Methods

#### parse

The library uses [meriyah](https://github.com/meriyah/meriyah) to create an [estree](https://github.com/estree/estree) compatible abstract syntax tree. All [meriyah parsing options](https://github.com/meriyah/meriyah#api) can be passed to the parse method.

```js
const { parse } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(tree) // { type: 'Program', body: [ ... ] }
```

```js
const { parse } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source, {
  loc: true,
  ranges: true,
})
console.log(tree) // { type: 'Program', body: [ ... ], loc: {...} }
```

#### generate

The library uses [astring](https://github.com/davidbonnet/astring) to generate the source code. All [astring generate options](https://github.com/davidbonnet/astring#api) can be passed to the generate method.

```js
const { parse, generate } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(generate(tree)) // 'const answer = 42;'
```

#### walk

Walk method is a thin layer over [estraverse](https://github.com/estools/estraverse).

```js
const { parse, walk } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
walk(tree, (node, parent) => {
  console.log(node)
  console.log(parent)
})
```

#### find

Find supports two traversal methods. You can pass a string selector or pass an object that will be compared to every node in the tree. The method returns an array of nodes.

The following selectors are supported:

- node type (`Identifier`)
- node attribute (`[name="foo"]`)
- node attribute existence (`[name]`)
- wildcard (`*`)

```js
const { parse, find } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(find(tree, "VariableDeclaration")) // [ { type: 'VariableDeclaration', ... } ]
console.log(find(tree, { type: "VariableDeclaration" })) // [ { type: 'VariableDeclaration', ... } ]
```

#### serialize

Serialize can transform nodes into values. Works for: Array, Boolean, Error, Infinity, Map, NaN, Number, Object, RegExp, Set, String, Symbol, WeakMap, WeakSet, null and undefined.

```js
const { serialize } = require("abstract-syntax-tree")
const node = {
  type: "ArrayExpression",
  elements: [
    { type: "Literal", value: 1 },
    { type: "Literal", value: 2 },
    { type: "Literal", value: 3 },
    { type: "Literal", value: 4 },
    { type: "Literal", value: 5 },
  ],
}
const array = serialize(node) // [1, 2, 3, 4, 5]
```

#### traverse

Traverse method accepts a configuration object with enter and leave callbacks. It allows multiple transformations in one traversal.

```js
const { parse, traverse } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
traverse(tree, {
  enter(node) {},
  leave(node) {},
})
```

#### replace

Replace extends [estraverse](https://github.com/estools/estraverse) by handling replacement of give node with multiple nodes. It will also remove given node if `null` is returned.

```js
const { parse, replace } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
replace(tree, (node) => {
  if (node.type === "VariableDeclaration") {
    node.kind = "let"
  }
  return node
})
```

#### remove

Remove uses [estraverse](https://github.com/estools/estraverse) and ensures that no useless nodes are left in the tree. It accepts a string, object or callback as the matching strategy.

```js
const { parse, remove, generate } = require("abstract-syntax-tree")
const source = '"use strict"; const b = 4;'
const tree = parse(source)
remove(tree, 'Literal[value="use strict"]')

// or
// remove(tree, { type: 'Literal', value: 'use strict' })

// or
// remove(tree, (node) => {
//   if (node.type === 'Literal' && node.value === 'use strict') return null
//   return node
// })

console.log(generate(tree)) // 'const b = 4;'
```

#### each

```js
const { parse, each } = require("abstract-syntax-tree")
const source = "const foo = 1; const bar = 2;"
const tree = parse(source)
each(tree, "VariableDeclaration", (node) => {
  console.log(node)
})
```

#### first

```js
const { parse, first } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(first(tree, "VariableDeclaration")) // { type: 'VariableDeclaration', ... }
```

#### last

```js
const { parse, last } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(last(tree, "VariableDeclaration")) // { type: 'VariableDeclaration', ... }
```

#### reduce

```js
const { parse, reduce } = require("abstract-syntax-tree")
const source = "const a = 1, b = 2"
const tree = parse(source)
const value = reduce(
  tree,
  (sum, node) => {
    if (node.type === "Literal") {
      sum += node.value
    }
    return sum
  },
  0
)
console.log(value) // 3
```

#### scope

Builds a lexical scope tree from the abstract syntax tree. The tree provides generic information about scopes, bindings (declarations) and references (usages), which is useful for analysis, renaming, dead code elimination, reactivity tracking and more.

```js
const { parse, scope } = require("abstract-syntax-tree")
const source = "const answer = 42; console.log(answer)"
const tree = parse(source)
const root = scope(tree)

console.log(root.type) // 'module'
console.log(root.bindings.map((binding) => binding.name)) // [ 'answer' ]
console.log(root.getBinding("answer").references.length) // 1
console.log(root.globals.map((global) => global.name)) // [ 'console' ]
```

Each scope exposes the following shape:

- `type` - the kind of scope (`module`, `global`, `function`, `block`, `for`, `switch`, `catch` or `class`)
- `node` - the node that creates the scope
- `parent` - the enclosing scope, or `null` for the root
- `children` - the nested scopes
- `bindings` - the declarations made in this scope
- `references` - the references that occur directly in this scope
- `globals` - unresolved references (populated on the root scope)
- `root` - the root scope of the tree
- `variableScope` - the nearest function or module scope (where `var` is hoisted)
- `getBinding(name)` - returns a binding declared in this scope
- `lookup(name)` - resolves a binding by name, walking up the scope chain
- `getReference(node)` - returns the reference for an identifier node (keyed by the node itself, so it handles shadowing), or `null` when the node is not a reference; the returned reference exposes the resolved `binding`

Each binding exposes:

- `name` - the declared name
- `kind` - the kind of binding (`var`, `let`, `const`, `function`, `class`, `param`, `catch`, `import` or `implicit`)
- `scope` - the scope the binding belongs to
- `identifier` / `declarations` - the identifier node(s) that declare the binding
- `node` - the declaration node
- `references` - all references that resolve to the binding
- `referenced` - whether the binding is used at least once
- `constant` - whether the binding is never reassigned
- `reads` / `writes` - the read and write references

Each reference exposes:

- `identifier` - the identifier node
- `name` - the referenced name
- `scope` - the scope the reference occurs in
- `parent` - the node that directly contains the identifier (e.g. the `CallExpression` for `foo()`), useful for understanding how a reference is used
- `binding` - the resolved binding, or `null` for a global
- `read` / `write` - how the value is used
- `resolved` - whether the reference resolved to a binding

Finding unused declarations (e.g. for dead code elimination):

```js
const { parse, scope } = require("abstract-syntax-tree")
const tree = parse("const used = 1; const unused = 2; used")
const root = scope(tree)
const unused = root.bindings.filter((binding) => !binding.referenced)
console.log(unused.map((binding) => binding.name)) // [ 'unused' ]
```

Finding reassigned variables (e.g. for reactivity):

```js
const { parse, scope } = require("abstract-syntax-tree")
const tree = parse("let a = 1; a = 2; const b = 3")
const root = scope(tree)
const mutable = root.bindings.filter((binding) => !binding.constant)
console.log(mutable.map((binding) => binding.name)) // [ 'a' ]
```

#### rename

Renames a variable and every reference to it, using [scope](#scope) analysis so that only the right identifiers are changed. Unlike a plain find and replace it leaves property keys, string literals, labels and unrelated variables in other scopes untouched, and it expands shorthand properties and adds `as` clauses to imports and exports where needed. The tree is mutated in place and returned.

```js
const { parse, generate, rename } = require("abstract-syntax-tree")
const tree = parse("const foo = 1; const o = { foo }; foo")
rename(tree, "foo", "bar")
console.log(generate(tree)) // const bar = 1; const o = { foo: bar }; bar;
```

Every binding with the given name is renamed, each together with its own references, so shadowed variables stay correct:

```js
const { parse, generate, rename } = require("abstract-syntax-tree")
const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
rename(tree, "foo", "bar")
console.log(generate(tree)) // let bar = 1; function f() { let bar = 2; return bar; } bar;
```

Pass `scope` to rename a single binding instead of every binding with that name. It takes `"all"` (the default), `"top"` for the binding declared in the root scope, or a scope from a [scope](#scope) call on the same tree:

```js
const { parse, generate, rename } = require("abstract-syntax-tree")
const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
rename(tree, "foo", "renamed", { scope: "top" })
console.log(generate(tree)) // let renamed = 1; function f() { let foo = 2; return foo; } renamed;
```

```js
const { parse, generate, scope, rename } = require("abstract-syntax-tree")
const tree = parse("let foo = 1; function f () { let foo = 2; return foo } foo")
const root = scope(tree)
rename(tree, "foo", "inner", { scope: root.children[0] })
console.log(generate(tree)) // let foo = 1; function f() { let inner = 2; return inner; } foo;
```

It throws when the new name is already declared in the same scope, which would change the meaning of the code:

```js
const { parse, rename } = require("abstract-syntax-tree")
const tree = parse("let foo = 1; let bar = 2")
rename(tree, "foo", "bar") // throws: Cannot rename "foo" to "bar": "bar" is already declared in the same scope
```

It also throws when the rename would leave an identifier resolving to a different binding. This is the dangerous case, because the result is valid code that quietly means something else, so it is rejected rather than emitted:

```js
const { parse, rename } = require("abstract-syntax-tree")
// f returns 1; renaming foo to bar would make it return 2
const tree = parse("const foo = 1; function f () { const bar = 2; return foo }")
rename(tree, "foo", "bar") // throws: a reference to "foo" would be captured by "bar" declared in an inner scope
```

```js
const { parse, rename } = require("abstract-syntax-tree")
// f returns the outer bar; renaming foo to bar would shadow it
const tree = parse("const bar = 1; function f () { const foo = 2; return bar }")
rename(tree, "foo", "bar") // throws: an existing reference to "bar" would be shadowed by the renamed binding
```

Nothing is mutated when a rename is rejected, so a throw always leaves the tree as it was.

#### prune

Removes unused declarations from the tree, a form of dead code elimination built on [scope](#scope) analysis. A declaration is removed only when it is not referenced anywhere and removing it cannot change behaviour. Removing one binding can make another unused, so pruning repeats until nothing else can be removed. The tree is mutated in place and returned.

```js
const { parse, generate, prune } = require("abstract-syntax-tree")
const tree = parse("const used = 1; const unused = 2; used")
prune(tree)
console.log(generate(tree)) // const used = 1; used;
```

```js
const { parse, generate, prune } = require("abstract-syntax-tree")
// a becomes unused once b is removed, so both go
const tree = parse("const a = 1; const b = a")
prune(tree)
console.log(generate(tree)) // (empty)
```

To stay safe, prune is deliberately conservative. It removes unreferenced `var`, `let`, `const` and `function` declarations, but keeps:

- declarations whose initializer may have side effects (`const x = compute()`, `const x = obj.prop`, `const x = [...items]`)
- exported declarations and anything referenced by an `export`
- destructuring declarations, function parameters, catch parameters and loop variables
- class declarations and imports
- write only bindings (a variable that is assigned but never read)

```js
const { parse, generate, prune } = require("abstract-syntax-tree")
// the call is kept because it may have side effects
const tree = parse("const x = compute()")
prune(tree)
console.log(generate(tree)) // const x = compute();
```

#### graph

Walks the module graph from an entry module and returns what it reaches: every module, the order they evaluate in, any circular imports and any external specifiers. Nothing is read from disk, so the modules to resolve against are given as `options.modules`, keyed by whatever ids you want to use.

```js
const { graph } = require("abstract-syntax-tree")
const modules = {
  "./math.js": "export const PI = 3.14",
  "./util.js": 'import "./math.js"'
}
const result = graph('import "./util.js"', { modules })
console.log(result.order) // [ "./math.js", "./util.js", "entry" ]
```

The result has the following shape:

- `entry` - the id of the entry module, `"entry"` unless you pass `options.entry`
- `modules` - a `Map` of id to module, each with `id`, `tree`, `dependencies`, `imports` and `exports`
- `order` - module ids in evaluation order, dependencies before their importers
- `cycles` - circular import paths, each ending where it started
- `externals` - specifiers left as imports, each listed once
- `missing` - unresolvable specifiers, only populated when `missing` is `"collect"`

Circular imports are valid modules, so they are reported rather than thrown on. The cycle is cut at the back edge, which leaves each module in the position ESM itself evaluates it in:

```js
const { graph } = require("abstract-syntax-tree")
const modules = { "./a.js": 'import "./b.js"', "./b.js": 'import "./a.js"' }
const result = graph('import "./a.js"', { modules })
console.log(result.cycles) // [ [ "./a.js", "./b.js", "./a.js" ] ]
```

A specifier that names a package rather than a module in the map is external and is not followed:

```js
const { graph } = require("abstract-syntax-tree")
const result = graph('import React from "react"', { modules: {} })
console.log(result.externals) // [ "react" ]
console.log(result.order) // [ "entry" ]
```

Resolution tries an exact key first, so a flat map keyed by the specifiers themselves needs no path handling at all. Otherwise a relative specifier is joined to its importer and tried with no extension, `.js`, `.mjs` and as a directory index. Pass `resolve` to replace this entirely, or `external` to mark specifiers as external without resolving them:

```js
const { graph } = require("abstract-syntax-tree")
const modules = { "src/math.js": "export const PI = 3.14" }
const result = graph('import "./math.js"', { modules, entry: "src/entry.js" })
console.log(result.order) // [ "src/math.js", "src/entry.js" ]
```

```js
const { graph } = require("abstract-syntax-tree")
// resolve receives the specifier and the id of the module importing it
const result = graph('import "./a.js"', {
  modules: { a: "const x = 1" },
  resolve: (specifier, importer) => "a"
})
console.log(result.order) // [ "a", "entry" ]
```

A resolver returns `null` to leave a specifier as an import, and `undefined` when it did not find anything, which is reported as missing rather than quietly turned into an external.

An unresolvable relative specifier throws, because it names a module that was meant to be there. Pass `missing: "collect"` to gather them instead:

```js
const { graph } = require("abstract-syntax-tree")
graph('import "./nope.js"', { modules: {} }) // throws: Cannot resolve "./nope.js" from "entry"
```

```js
const { graph } = require("abstract-syntax-tree")
const result = graph('import "./nope.js"', { modules: {}, missing: "collect" })
console.log(result.missing) // [ { specifier: "./nope.js", importer: "entry" } ]
```

#### bundle

Bundles the entry module and everything it imports into a single program. Module bodies are concatenated into one scope, so the output reads like the source: there is no runtime, no wrapper functions and no module registry. Bindings are renamed only where names actually collide, which means a set of modules with no clashes comes out exactly as it went in. Nothing is read from disk, so the modules are given as `options.modules`, the same way [graph](#graph) takes them.

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = {
  "./math.js": "export const PI = 3.14; export default function multiply (a, b) { return a * b }"
}
const entry = 'import multiply, { PI } from "./math.js"; console.log(multiply(PI, 2))'
console.log(generate(bundle(entry, { modules })))
// const PI = 3.14;
// function multiply(a, b) { return a * b; }
// console.log(multiply(PI, 2));
```

Because everything ends up in one scope, a name used by two modules has to move. Dependencies are deconflicted first, so the module that is imported keeps its name:

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = { "./math.js": "export const PI = 3.14" }
const entry = 'import { PI as P } from "./math.js"; const PI = 3; console.log(P, PI)'
console.log(generate(bundle(entry, { modules })))
// const PI = 3.14;
// const PI$1 = 3;
// console.log(PI, PI$1);
```

Unused exports are removed with [prune](#prune), which sees the hoisted code as ordinary declarations. Pass `treeshake: false` to keep everything:

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = { "./math.js": "export const used = 1; export const unused = 2" }
const entry = 'import { used } from "./math.js"; console.log(used)'
console.log(generate(bundle(entry, { modules }))) // const used = 1; console.log(used);
```

A namespace import is dissolved into the bindings it reads when every use is a static property access. When the namespace is used as a value, or read with a computed key, the object is built instead, with a getter per name so the bindings stay live:

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = { "./math.js": "export const PI = 3.14; export const E = 2.71" }
const entry = 'import * as math from "./math.js"; console.log(math.PI)'
console.log(generate(bundle(entry, { modules }))) // const PI = 3.14; console.log(PI);
```

Specifiers that name a package rather than a module in the map stay as imports, and locals for the same external binding are shared so each source produces one import:

```js
const { bundle, generate } = require("abstract-syntax-tree")
const entry = 'import React from "react"; console.log(React)'
console.log(generate(bundle(entry, { modules: {} })))
// import React from "react";
// console.log(React);
```

The options are the ones [graph](#graph) takes - `entry`, `modules`, `resolve`, `external` and `missing` - plus:

- `treeshake` - whether to remove unused declarations, `true` by default
- `namespace` - `"auto"` (default) or `"object"` to always build the namespace object
- `cycles` - `"allow"` (default) or `"throw"`

Caveats:

- the module trees are mutated and spliced into the result, so pass trees you can afford to lose, or re-parse
- modules in, modules out - CommonJS is not converted
- nothing is read from disk, so `modules` is the whole universe
- `import.meta` and dynamic `import()` are passed through untouched, which means a dynamic import is not followed and its specifier is left as written
- hoisting reorders statements, so a circular dependency that worked as separate modules can become a temporal dead zone error; [graph](#graph) reports `cycles` if you want to check first
- the entry's exports are stripped with everyone else's and re-emitted at the end, so they keep their public names even when the binding behind them is renamed

#### CommonJS

A module written as CommonJS is converted to modules syntax before anything else looks at it, so [graph](#graph) sees its requires as the dependencies they are and [bundle](#bundle) can hoist it like everything else. Nothing opts in; a module that already uses `import` or `export` is left exactly as it was.

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = { "./math.js": "function add (a, b) { return a + b }\nmodule.exports = add" }
const entry = 'import add from "./math.js"\nconsole.log(add(1, 2))'
console.log(generate(bundle(entry, { modules })))
// function add(a, b) { return a + b; }
// console.log(add(1, 2));
```

`module.exports = { a, b }` becomes a default export *and* named exports for the keys that can be read statically, the same thing Node does, so both import styles work and unused names still shake out:

```js
const { bundle, generate } = require("abstract-syntax-tree")
const modules = { "./m.js": "const a = 1\nconst unused = 2\nmodule.exports = { a, unused }" }
const entry = 'import { a } from "./m.js"\nconsole.log(a)'
console.log(generate(bundle(entry, { modules }))) // const a = 1; console.log(a);
```

What is converted:

- `const x = require("./y")` and `const { a, b } = require("./y")` at the top level
- `require("./y")` on its own, for side effects
- `module.exports = <identifier>` and `module.exports = <expression>`
- `module.exports = { a, b }`, which also produces named exports
- `exports.name = <expression>`

Everything else is refused by name rather than translated into something that looks right and behaves differently. A require that is computed, nested in a function or inside a condition cannot be resolved without running the code; `__dirname` and `__filename` have no meaning once modules are concatenated; and a reassigned `module.exports` has no single value to export:

```js
const { bundle } = require("abstract-syntax-tree")
const modules = { "./m.js": 'module.exports = function () { return require("./other.js") }' }
bundle('import "./m.js"', { modules })
// throws: Cannot convert "./m.js" from CommonJS: a require call outside a top level declaration
```

`require`, `module` and `exports` only mean CommonJS when they are free variables, so a module that declares its own is an ordinary script and is left alone.

Pass `commonjs: false` to turn the conversion off and treat every module as written. `graph` records which modules were converted, as `commonjs` on each one. Nothing here reads a `package.json` or consults a `type` field; the format is read off the code itself, which is what keeps [graph](#graph) and [bundle](#bundle) free of any package manager.

#### Reading from disk

The library itself never touches the filesystem, which is what keeps it usable anywhere and free of a resolver of its own. `abstract-syntax-tree/fs` is a separate entry point that provides the two callbacks [graph](#graph) and [bundle](#bundle) need to work against real files, so requiring it is how you opt in to disk access:

```js
const path = require("node:path")
const { bundle, generate } = require("abstract-syntax-tree")
const { modules, resolve } = require("abstract-syntax-tree/fs")

const entry = path.resolve("src/index.js")
console.log(generate(bundle(modules(entry), { entry, modules, resolve })))
```

- `modules(id)` reads a file, or returns `undefined` when the id is not a readable file
- `resolve(specifier, importer)` resolves against the importer's directory, trying no extension, `.js`, `.mjs` and a directory index
- `resolver(options)` builds a resolver, which is how you turn on `packages`

Resolution is anchored to the importer rather than the working directory, and a relative specifier that matches no file is reported as missing instead of being left as an import. Ids are canonical paths, so a file reached through a symlink and through a relative path is one module rather than two.

A bare specifier names a package, and by default it stays an import the way it does in every other bundler. Pass `packages: true` to read it out of `node_modules` and pull it into the bundle instead:

```js
const path = require("node:path")
const { bundle, generate } = require("abstract-syntax-tree")
const { modules, resolver } = require("abstract-syntax-tree/fs")

const resolve = resolver({ packages: true })
const entry = path.resolve("src/index.js")
console.log(generate(bundle(modules(entry), { entry, modules, resolve })))
```

Packages are resolved with Node's own algorithm, so package walking, `main`, `exports` maps, subpaths like `lodash/fp` and scoped names all behave the way they do everywhere else. Node builtins stay external. Most packages on npm are CommonJS, which is [converted](#commonjs) on the way in.

Both are ordinary functions, so layering your own rules on top is just a wrapper:

```js
const path = require("node:path")
const { modules, resolve } = require("abstract-syntax-tree/fs")

const alias = (specifier, importer) =>
  specifier.startsWith("~/")
    ? path.resolve("src", specifier.slice(2))
    : resolve(specifier, importer)

// pass { modules, resolve: alias } to graph or bundle
```

#### has

```js
const { parse, has } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(has(tree, "VariableDeclaration")) // true
console.log(has(tree, { type: "VariableDeclaration" })) // true
```

#### count

```js
const { parse, count } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
console.log(count(tree, "VariableDeclaration")) // 1
console.log(count(tree, { type: "VariableDeclaration" })) // 1
```

#### append

Append pushes nodes to the body of the abstract syntax tree. It accepts estree nodes as input.

```js
const { parse, append } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
append(tree, {
  type: "ExpressionStatement",
  expression: {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: {
        type: "Identifier",
        name: "console",
      },
      property: {
        type: "Identifier",
        name: "log",
      },
      computed: false,
    },
    arguments: [
      {
        type: "Identifier",
        name: "answer",
      },
    ],
  },
})
```

Strings will be converted into abstract syntax tree under the hood. Please note that this approach might make the code run a bit slower due to an extra interpretation step.

```js
const { parse, append } = require("abstract-syntax-tree")
const source = "const answer = 42"
const tree = parse(source)
append(tree, "console.log(answer)")
```

#### prepend

Prepend unshifts nodes to the body of the abstract syntax tree. Accepts estree nodes or strings as input, same as append.

```js
const { parse, prepend } = require("abstract-syntax-tree")
const source = "const a = 1;"
const tree = parse(source)
prepend(tree, {
  type: "ExpressionStatement",
  expression: {
    type: "Literal",
    value: "use strict",
  },
})
```

#### equal

```js
const { equal } = require("abstract-syntax-tree")
console.log(
  equal({ type: "Literal", value: 42 }, { type: "Literal", value: 42 })
) // true
console.log(
  equal({ type: "Literal", value: 41 }, { type: "Literal", value: 42 })
) // false
```

#### match

```js
const { match } = require("abstract-syntax-tree")
console.log(match({ type: "Literal", value: 42 }, "Literal[value=42]")) // true
console.log(match({ type: "Literal", value: 41 }, "Literal[value=42]")) // false
```

#### template

The function converts the input to an equivalent abstract syntax tree representation. The function uses a `<%= %>` syntax to insert nodes.

You can also use standard javascript types and they're going to be transformed automatically.

```js
const { template } = require("abstract-syntax-tree")
const literal = template(42)
const nodes = template("const foo = <%= bar %>;", {
  bar: { type: "Literal", value: 1 },
})
```

```js
const { template } = require("abstract-syntax-tree")
const nodes = template("function foo(<%= bar %>) {}", {
  bar: [
    { type: "Identifier", name: "baz" },
    { type: "Identifier", name: "qux" },
  ],
})
```

```js
const { template } = require("abstract-syntax-tree")
const literal = template(42)
const nodes = template("const foo = <%= bar %>;", {
  bar: 1,
})
```

#### program

Creates an abstract syntax tree with a blank program.

```js
const { program } = require("abstract-syntax-tree")
const tree = program() // { type: 'Program', sourceType: 'module', body: [] }
```

#### iife

Creates an abstract syntax tree for an immediately invoked function expression.

```js
const { iife } = require("abstract-syntax-tree")
const node = iife() // { type: 'ExpressionStatement', expression: { ... } }
```

### Instance Methods

Almost all of the static methods (excluding parse, generate, template and match) have their instance equivalents. There are few extra instance methods:

#### mark

```js
const AbstractSyntaxTree = require("abstract-syntax-tree")
const tree = new AbstractSyntaxTree("const a = 1")
tree.mark()
console.log(tree.first("Program").cid) // 1
console.log(tree.first("VariableDeclaration").cid) // 2
```

#### wrap

```js
const AbstractSyntaxTree = require("abstract-syntax-tree")
const source = "const a = 1"
const tree = new AbstractSyntaxTree(source)
tree.wrap((body) => {
  return [
    {
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "FunctionExpression",
          params: [],
          body: {
            type: "BlockStatement",
            body,
          },
        },
        arguments: [],
      },
    },
  ]
})
```

#### unwrap

```js
const AbstractSyntaxTree = require("abstract-syntax-tree")
const source = "(function () { console.log(1); }())"
const tree = new AbstractSyntaxTree(source)
tree.unwrap()
console.log(tree.source) // console.log(1);
```

### Getters

#### body

Gives the body of the root node.

#### source

Gives access to the source code representation of the abstract syntax tree.

```js
const AbstractSyntaxTree = require("abstract-syntax-tree")
const source = 'const foo = "bar";'
const tree = new AbstractSyntaxTree(source)
console.log(tree.source) // const foo = "bar";
```

#### map

Gives the source map of the source code.

### Setters

#### body

Sets the body of the root node.

## Transformations

#### toBinaryExpression

```js
const { toBinaryExpression } = require("abstract-syntax-tree")
const expression = {
  type: "ArrayExpression",
  elements: [
    { type: "Literal", value: "foo" },
    { type: "Literal", value: "bar" },
    { type: "Literal", value: "baz" },
  ],
}
console.log(toBinaryExpression(expression)) // { type: 'BinaryExpression', ... }
```

## Nodes

You can also use classes to create nodes.

```js
const { ArrayExpression, Literal } = require("abstract-syntax-tree")
const expression = new ArrayExpression([
  new Literal("foo"),
  new Literal("bar"),
  new Literal("baz"),
])
```

Here's a list of all available nodes, with examples.

| Type                     |                             Example                              |
| ------------------------ | :--------------------------------------------------------------: |
| ArrayExpression          |                   <code>const foo = []</code>                    |
| ArrayPattern             |               <code>const [foo, bar] = bar</code>                |
| ArrowFunctionExpression  |                     <code>(() => {})</code>                      |
| AssignmentExpression     |                      <code>foo = bar</code>                      |
| AssignmentOperator       |                                                                  |
| AssignmentPattern        |             <code>function foo(bar = baz) {} </code>             |
| AwaitExpression          |           <code>(async () => { await foo() })()</code>           |
| BigIntLiteral            |                                                                  |
| BinaryExpression         |                      <code>foo + bar</code>                      |
| BinaryOperator           |                                                                  |
| BlockStatement           |                <code>{ console.log(foo) }</code>                 |
| BreakStatement           |               <code>for (foo in bar) break</code>                |
| CallExpression           |                        <code>foo()</code>                        |
| CatchClause              |               <code>try {} catch (error) {}</code>               |
| ChainElement             |                                                                  |
| ChainExpression          |                       <code>foo?.()</code>                       |
| Class                    |                                                                  |
| ClassBody                |                    <code>class Foo {}</code>                     |
| ClassDeclaration         |                    <code>class Foo {}</code>                     |
| ClassExpression          |                     <code>(class {})</code>                      |
| ConditionalExpression    |                   <code>foo ? bar : baz</code>                   |
| ContinueStatement        |              <code>while(true) { continue }</code>               |
| DebuggerStatement        |                      <code>debugger</code>                       |
| Declaration              |                                                                  |
| Directive                |                                                                  |
| DoWhileStatement         |                <code>do {} while (true) {}</code>                |
| EmptyStatement           |                          <code>;</code>                          |
| ExportAllDeclaration     |                <code>export \* from "foo"</code>                 |
| ExportDefaultDeclaration |                 <code>export default foo</code>                  |
| ExportNamedDeclaration   |                <code>export { foo as bar }</code>                |
| ExportSpecifier          |                   <code>export { foo }</code>                    |
| Expression               |                                                                  |
| ExpressionStatement      |                         <code>foo</code>                         |
| ForInStatement           |                 <code>for (foo in bar) {}</code>                 |
| ForOfStatement           |                 <code>for (foo of bar) {}</code>                 |
| ForStatement             |          <code>for (let i = 0; i < 10; i ++) {}</code>           |
| Function                 |                                                                  |
| FunctionBody             |                                                                  |
| FunctionDeclaration      |                 <code>function foo () {}</code>                  |
| FunctionExpression       |                  <code>(function () {})</code>                   |
| Identifier               |                         <code>foo</code>                         |
| IfStatement              |                     <code>if (foo) {}</code>                     |
| ImportDeclaration        |                    <code>import "foo"</code>                     |
| ImportDefaultSpecifier   |                <code>import foo from "bar"</code>                |
| ImportExpression         |                <code>import(foo).then(bar)</code>                |
| ImportNamespaceSpecifier |             <code>import \* as foo from "bar"</code>             |
| ImportSpecifier          |              <code>import { foo } from "bar"</code>              |
| LabeledStatement         |                     <code>label: foo</code>                      |
| Literal                  |                         <code>42</code>                          |
| LogicalExpression        |                    <code>true && false</code>                    |
| LogicalOperator          |                                                                  |
| MemberExpression         |                       <code>foo.bar</code>                       |
| MetaProperty             |           <code>function foo () { new.target }</code>            |
| MethodDefinition         |               <code>class Foo { bar() {} }</code>                |
| ModuleDeclaration        |                                                                  |
| ModuleSpecifier          |                                                                  |
| NewExpression            |                      <code>new Foo()</code>                      |
| Node                     |                                                                  |
| ObjectExpression         |                        <code>({})</code>                         |
| ObjectPattern            |                <code>function foo ({}) {}</code>                 |
| Pattern                  |                                                                  |
| Position                 |                                                                  |
| Program                  |                         <code>42</code>                          |
| Property                 |                                                                  |
| RegExpLiteral            |                                                                  |
| RestElement              |              <code>function foo (...bar) {}</code>               |
| ReturnStatement          |           <code>function foo () { return bar }</code>            |
| SequenceExpression       |                      <code>foo, bar</code>                       |
| SourceLocation           |                                                                  |
| SpreadElement            |                                                                  |
| Statement                |                                                                  |
| Super                    | <code>class Foo extends Bar { constructor() { super() } }</code> |
| SwitchCase               |            <code>switch (foo) { case 'bar': }</code>             |
| SwitchStatement          |                   <code>switch(foo) {}</code>                    |
| TaggedTemplateExpression |              <code>css`.foo { color: red; }`</code>              |
| TemplateLiteral          |              <code>css`.foo { color: red; }`</code>              |
| ThisExpression           |                  <code>this.foo = 'bar'</code>                   |
| ThrowStatement           |               <code>throw new Error("foo")</code>                |
| TryStatement             |      <code>try { foo() } catch (exception) { bar() }</code>      |
| UnaryExpression          |                        <code>!foo</code>                         |
| UnaryOperator            |                                                                  |
| UpdateExpression         |                        <code>foo++</code>                        |
| UpdateOperator           |                                                                  |
| VariableDeclaration      |                  <code>const answer = 42</code>                  |
| VariableDeclarator       |                  <code>const foo = 'bar'</code>                  |
| WhileStatement           |                   <code>while (true) {}</code>                   |
| WithStatement            |                    <code>with (foo) {}</code>                    |
| YieldExpression          |           <code>function\* foo() { yield bar }</code>            |

## Optimizations

### How can you optimize an abstract syntax tree?

Abstract syntax tree is a tree-like structure that represents your program. The program is interpreted at some point, e.g. in your browser. Everything takes time, and the same applies to the interpretation. Some of the operations, e.g. adding numbers can be done at compile time, so that the interpreter has less work to do. Having less work to do means that your program will run faster.

### Usage

```js
const { binaryExpressionReduction } = require("abstract-syntax-tree")
```

### What optimization techniques are available?

#### binaryExpressionReduction

```js
const number = 2 + 2
```

In the example above we have added two numbers. We could optimize the code by:

```js
const number = 4
```

The tree would be translated from:

```json
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": { "type": "Literal", "value": 2 },
  "right": { "type": "Literal", "value": 2 }
}
```

to

```json
{ "type": "Literal", "value": 4 }
```

#### ifStatementRemoval

```js
if (true) {
  console.log("foo")
} else {
  console.log("bar")
}
```

It seems that we'll only enter the true path. We can simplify the code to:

```js
console.log("foo")
```

The tree would be translated from:

```json
{
  "type": "IfStatement",
  "test": {
    "type": "Literal",
    "value": true
  },
  "consequent": {
    "type": "BlockStatement",
    "body": [
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "object": {
              "type": "Identifier",
              "name": "console"
            },
            "property": {
              "type": "Identifier",
              "name": "log"
            },
            "computed": false
          },
          "arguments": [
            {
              "type": "Literal",
              "value": "foo"
            }
          ]
        }
      }
    ]
  },
  "alternate": {
    "type": "BlockStatement",
    "body": [
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "MemberExpression",
            "object": {
              "type": "Identifier",
              "name": "console"
            },
            "property": {
              "type": "Identifier",
              "name": "log"
            },
            "computed": false
          },
          "arguments": [
            {
              "type": "Literal",
              "value": "bar"
            }
          ]
        }
      }
    ]
  }
}
```

to:

```js
{
        "type": "CallExpression",
        "callee": {
          "type": "MemberExpression",
          "object": {
            "type": "Identifier",
            "name": "console"
          },
          "property": {
            "type": "Identifier",
            "name": "log"
          },
          "computed": false
        },
        "arguments": [
          {
            "type": "Literal",
            "value": "foo"
          }
        ]
      }
```

#### negationOperatorRemoval

```js
if (!(foo === bar)) {
  console.log("foo")
}
```

It seems that our negation operator could be a part of the condition inside the brackets.

```js
if (foo !== bar) {
  console.log("foo")
}
```

The tree would be translated from:

```json
{
  "type": "UnaryExpression",
  "operator": "!",
  "prefix": true,
  "argument": {
    "type": "BinaryExpression",
    "left": {
      "type": "Identifier",
      "name": "foo"
    },
    "operator": "===",
    "right": {
      "type": "Identifier",
      "name": "bar"
    }
  }
}
```

to

```json
{
  "type": "BinaryExpression",
  "left": {
    "type": "Identifier",
    "name": "foo"
  },
  "operator": "!==",
  "right": {
    "type": "Identifier",
    "name": "bar"
  }
}
```

#### logicalExpressionReduction

```js
const foo = "bar" || "baz"
```

The first value is truthy so it's safe to simplify the code.

```js
const foo = "bar"
```

The tree would be translated from:

```json
{
  "type": "LogicalExpression",
  "left": {
    "type": "Literal",
    "value": "bar"
  },
  "operator": "||",
  "right": {
    "type": "Literal",
    "value": "baz"
  }
}
```

To:

```json
{
  "type": "Literal",
  "value": "bar"
}
```

#### ternaryOperatorReduction

```js
const foo = true ? "bar" : "baz"
```

Given a known value of the conditional expression it's possible to get the right value immediately.

```js
const foo = "bar"
```

The tree would be translated from:

```json
{
  "type": "ConditionalExpression",
  "test": {
    "type": "Literal",
    "value": true
  },
  "consequent": {
    "type": "Literal",
    "value": "bar"
  },
  "alternate": {
    "type": "Literal",
    "value": "baz"
  }
}
```

To:

```json
{
  "type": "Literal",
  "value": "bar"
}
```

#### typeofOperatorReduction

```js
const foo = typeof "bar"
```

It's possible to determine the type of some variables during analysis.

```js
const foo = "string"
```

The tree would be translated from:

```json
{
  "type": "UnaryExpression",
  "operator": "typeof",
  "prefix": true,
  "argument": {
    "type": "Literal",
    "value": "foo"
  }
}
```

To:

```json
{
  "type": "Literal",
  "value": "string"
}
```

#### memberExpressionReduction

```js
const foo = { bar: "baz" }.bar
```

Given an inlined object expression it's possible to retrieve the value immediately.

```js
const foo = "baz"
```

The tree would be translated from:

```json
{
  "type": "MemberExpression",
  "object": {
    "type": "ObjectExpression",
    "properties": [
      {
        "type": "Property",
        "method": false,
        "shorthand": false,
        "computed": false,
        "key": {
          "type": "Identifier",
          "name": "bar"
        },
        "value": {
          "type": "Literal",
          "value": "baz"
        },
        "kind": "init"
      }
    ]
  },
  "property": {
    "type": "Identifier",
    "name": "baz"
  },
  "computed": false
}
```

To:

```json
{
  "type": "Literal",
  "value": "baz"
}
```

## Browser

The library is not intended to work inside of a browser. This might change in the future, but it's a bigger lift, pretty time consuming. For now, consider exposing and using an API endpoint instead.

## Maintainers

[@emilos](https://github.com/emilos).

## Contributing

All contributions are highly appreciated! [Open an issue](https://github.com/buxlabs/abstract-syntax-tree/issues/new) or a submit PR.

The lib follows the tdd approach and is expected to have a high code coverage. Please follow the [Contributor Covenant Code of Conduct](https://github.com/buxlabs/abstract-syntax-tree/blob/master/CODE_OF_CONDUCT.md).

## License

MIT © buxlabs
