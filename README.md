# abstract-syntax-tree

[![npm](https://img.shields.io/npm/v/abstract-syntax-tree.svg)](https://www.npmjs.com/package/abstract-syntax-tree) [![build](https://github.com/buxlabs/abstract-syntax-tree/workflows/build/badge.svg)](https://github.com/buxlabs/abstract-syntax-tree/actions) 

> A library for working with abstract syntax trees.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [REPL](https://buxlabs.pl/en/tools/js/ast)
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

The goal of this library is to consolidate common abstract syntax tree operations in one place. It uses a variety of libriaries under the hood based on their performance and flexibility, e.g. [meriyah](https://github.com/meriyah/meriyah) for parsing and [astring](https://github.com/davidbonnet/astring) for source code generation.

The library exposes a set of utility methods that can be useful for analysis or transformation of abstract syntax trees. It supports functional and object-oriented programming style.

## Install

```bash
npm install abstract-syntax-tree
```

## Usage

```js
const { parse, find } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(find(tree, 'Literal')) // [ { type: 'Literal', value: 42 } ]
```

```js
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = new AbstractSyntaxTree(source)
console.log(tree.find('Literal')) // [ { type: 'Literal', value: 42 } ]
```

## API

### Static Methods

#### parse

The library uses [meriyah](https://github.com/meriyah/meriyah) to create an [estree](https://github.com/estree/estree) compatible abstract syntax tree. All [meriyah parsing options](https://github.com/meriyah/meriyah#api) can be passed to the parse method.

```js
const { parse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(tree) // { type: 'Program', body: [ ... ] }
```

```js
const { parse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source, {
  loc: true,
  ranges: true
})
console.log(tree) // { type: 'Program', body: [ ... ], loc: {...} }
```

#### generate

The library uses [astring](https://github.com/davidbonnet/astring) to generate the source code. All [astring generate options](https://github.com/davidbonnet/astring#api) can be passed to the generate method.

```js
const { parse, generate } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(generate(tree)) // 'const answer = 42;'
```

#### walk

Walk method is a thin layer over [estraverse](https://github.com/estools/estraverse).

```js
const { parse, walk } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
walk(tree, (node, parent) => {
  console.log(node)
  console.log(parent)
})
```

#### find

Find supports two traversal methods. You can pass an [esquery](https://github.com/estools/esquery) compatible selector or pass an object that will be compared to every node in the tree. The method returns an array of nodes.

```js
const { parse, find } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(find(tree, 'VariableDeclaration')) // [ { type: 'VariableDeclaration', ... } ]
console.log(find(tree, { type: 'VariableDeclaration' })) // [ { type: 'VariableDeclaration', ... } ]
```

#### serialize

Serialize can transform nodes into values. More documentation can be found here [asttv](https://github.com/buxlabs/asttv).

```js
const { serialize } = require('abstract-syntax-tree')
const node = {
  type: 'ArrayExpression',
  elements: [
    { type: 'Literal', value: 1 },
    { type: 'Literal', value: 2 },
    { type: 'Literal', value: 3 },
    { type: 'Literal', value: 4 },
    { type: 'Literal', value: 5 }
  ]
}
const result = serialize(node)

console.log(result) // [1, 2, 3, 4, 5]
```

#### traverse

Traverse method accepts a configuration object with enter and leave callbacks. It allows multiple transformations in one traversal.

```js
const { parse, traverse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
traverse(tree, {
  enter (node) {},
  leave (node) {}
})
```

#### replace

Replace extends [estraverse](https://github.com/estools/estraverse) by handling replacement of give node with multiple nodes. It will also remove given node if `null` is returned.

```js
const { parse, replace } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
replace(tree, node => {
  if (node.type === 'VariableDeclaration') {
    node.kind = 'let'
  }
  return node
})
```

#### remove

Remove uses [estraverse](https://github.com/estools/estraverse) and ensures that no useless nodes are left in the tree. It accepts a string, object or callback as the matching strategy.

```js
const { parse, remove, generate } = require('abstract-syntax-tree')
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
const { parse, each } = require('abstract-syntax-tree')
const source = 'const foo = 1; const bar = 2;'
const tree = parse(source)
each(tree, 'VariableDeclaration', node => {
  console.log(node)
})
```

#### first

```js
const { parse, first } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(first(tree, 'VariableDeclaration')) // { type: 'VariableDeclaration', ... }
```

#### last

```js
const { parse, last } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(last(tree, 'VariableDeclaration')) // { type: 'VariableDeclaration', ... }
```

#### reduce

```js
const { parse, reduce } = require('abstract-syntax-tree')
const source = 'const a = 1, b = 2'
const tree = parse(source)
const value = reduce(tree, (sum, node) => {
  if (node.type === 'Literal') {
    sum += node.value
  }
  return sum
}, 0)
console.log(value) // 3
```

#### has

```js
const { parse, has } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(has(tree, 'VariableDeclaration')) // true
console.log(has(tree, { type: 'VariableDeclaration' })) // true
```

#### count

```js
const { parse, count } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(count(tree, 'VariableDeclaration')) // 1
console.log(count(tree, { type: 'VariableDeclaration' })) // 1
```

#### append

Append pushes nodes to the body of the abstract syntax tree. It accepts estree nodes as input.

```js
const { parse, append } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
append(tree, {
  type: 'ExpressionStatement',
  expression:  {
    type: "CallExpression",
    callee: {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: 'console'
      },
      property: {
        type: 'Identifier',
        name: 'log'
      },
      computed: false
    },
    arguments: [
      {
        type: 'Identifier',
        name: 'answer'
      }
    ]
  }
})
```

Strings will be converted into abstract syntax tree under the hood. Please note that this approach might make the code run a bit slower due to an extra interpretation step.

```js
const { parse, append } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
append(tree, 'console.log(answer)')
```

#### prepend

Prepend unshifts nodes to the body of the abstract syntax tree. Accepts estree nodes or strings as input, same as append.

```js
const { parse, prepend } = require('abstract-syntax-tree')
const source = 'const a = 1;'
const tree = parse(source)
prepend(tree, {
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'use strict'
  }
})
```

#### equal

```js
const { equal } = require('abstract-syntax-tree')
console.log(equal({ type: 'Literal', value: 42 }, { type: 'Literal', value: 42 })) // true
console.log(equal({ type: 'Literal', value: 41 }, { type: 'Literal', value: 42 })) // false
````

#### template

```js
const { template } = require('abstract-syntax-tree')
const literal = template(42)
const nodes = template('const foo = <%= bar %>;', { bar: { type: 'Literal', value: 1 } })
```

### Instance Methods

Almost all of the static methods (excluding parse, generate, template and equal) have their instance equivalents. There are few extra instance methods:

#### mark

```js
const AbstractSyntaxTree = require('abstract-syntax-tree')
const tree = new AbstractSyntaxTree('const a = 1')
tree.mark()
console.log(tree.first('Program').cid) // 1
console.log(tree.first('VariableDeclaration').cid) // 2
```

#### wrap

```js
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = 'const a = 1'
const tree = new AbstractSyntaxTree(source)
tree.wrap(body => {
    return [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'FunctionExpression',
            params: [],
            body: {
              type: 'BlockStatement',
              body
            }
          },
          arguments: []
        }
      }
    ]
})
```

#### unwrap

```js
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = '(function () { console.log(1); }())'
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
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = 'const foo = "bar";'
const tree = new AbstractSyntaxTree(source)
console.log(tree.source) // const foo = "bar";
```

#### map

Gives the source map of the source code.

### Setters

#### body

Sets the body of the root node.

## Maintainers

[@emilos](https://github.com/emilos).

## Contributing

All contributions are highly appreciated! [Open an issue](https://github.com/buxlabs/abstract-syntax-tree/issues/new) or a submit PR.

The lib follows the tdd approach and is expected to have a high code coverage. Please follow the [Contributor Covenant Code of Conduct](https://github.com/buxlabs/abstract-syntax-tree/blob/master/CODE_OF_CONDUCT.md).

## License

MIT © buxlabs
