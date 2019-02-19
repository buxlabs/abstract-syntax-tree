# abstract-syntax-tree

![npm](https://img.shields.io/npm/v/abstract-syntax-tree.svg) ![build](https://img.shields.io/codeship/c6391230-e90c-0136-c202-269c372fd6f7/master.svg)

> Abstract Syntax Tree

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

```js
const { parse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(tree) // { type: 'Program', body: [ ... ] }
```

The library uses [cherow](https://github.com/cherow/cherow) to create an [estree](https://github.com/estree/estree) compatible abstract syntax tree. All [cherow parsing options](https://github.com/cherow/cherow#options) can be passed to the parse method.

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

```js
const { parse, generate } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(generate(tree)) // 'const answer = 42;'
```

#### walk

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

```js
const { parse, find } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(find(tree, 'VariableDeclaration')) // [ { type: 'VariableDeclaration', ... } ]
console.log(find(tree, { type: 'VariableDeclaration' })) // [ { type: 'VariableDeclaration', ... } ]
```

#### traverse

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

```js
const { parse, replace } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
replace(tree, {
  enter (node) {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'let'
    }
    return node
  }
})
```

#### remove

```js
const { parse, remove, generate } = require('abstract-syntax-tree')
const source = '"use strict"; const b = 4;'
const ast = parse(source)
remove(tree, { type: 'Literal', value: 'use strict' })
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

#### prepend

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

#### append

```js
const { parse, append } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
append(tree, {
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'test'
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

Gives you the body of the root node.

#### source

Gives you access to the source code representation of the abstract syntax tree.

```js
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = 'const foo = "bar";'
const tree = new AbstractSyntaxTree(source)
console.log(tree.source) // const foo = "bar";
```

#### map

Gives you the source map of the source code.

### Setters

#### body

Lets you set the body of the root node.

## Maintainers

[@emilos](https://github.com/emilos).

## Contributing

All contributions are highly appreciated! [Open an issue](https://github.com/buxlabs/abstract-syntax-tree/issues/new) or a submit PR.

The lib follows the tdd approach and is expected to have a high code coverage. Please follow the [Contributor Covenant Code of Conduct](https://github.com/buxlabs/abstract-syntax-tree/blob/master/CODE_OF_CONDUCT.md).

## License

MIT © buxlabs
