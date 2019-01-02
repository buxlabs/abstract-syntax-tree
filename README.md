# abstract-syntax-tree

![npm](https://img.shields.io/npm/v/abstract-syntax-tree.svg) ![build](https://img.shields.io/codeship/c6391230-e90c-0136-c202-269c372fd6f7/master.svg)


## What is an abstract syntax tree?

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

## Installation

`npm install abstract-syntax-tree`

## How does it work?

The library exposes a set of utility methods that can be useful for analysis or transformation of abstract syntax trees. It supports functional and object-oriented programming style.

## Examples

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

```javascript
const { parse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(tree) // { type: 'Program', body: [ ... ] }
```

#### generate

```javascript
const { parse, generate } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(generate(tree)) // 'const answer = 42;'
```

#### walk

```javascript
const { parse, walk } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
walk(tree, (node, parent) => {
  console.log(node)
  console.log(parent)
})
```

#### find

```javascript
const { parse, find } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(find(tree, 'VariableDeclaration')) // [ { type: 'VariableDeclaration', ... } ]
console.log(find(tree, { type: 'VariableDeclaration' })) // [ { type: 'VariableDeclaration', ... } ]
```

#### traverse

```javascript
const { parse, traverse } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
traverse(tree, {
  enter (node) {},
  leave (node) {}
})
```

#### replace

```javascript
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

```javascript
const { parse, remove, generate } = require('abstract-syntax-tree')
const source = '"use strict"; const b = 4;'
const ast = parse(source)
remove(tree, { type: 'Literal', value: 'use strict' })
console.log(generate(tree)) // 'const b = 4;'
```

#### each

```javascript
const { parse, each } = require('abstract-syntax-tree')
const source = 'const foo = 1; const bar = 2;'
const tree = parse(source)
each(tree, 'VariableDeclaration', node => {
  console.log(node)
})
```

#### first

```javascript
const { parse, first } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(first(tree, 'VariableDeclaration')) // { type: 'VariableDeclaration', ... }
```

#### last

```javascript
const { parse, last } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(last(tree, 'VariableDeclaration')) // { type: 'VariableDeclaration', ... }
```

#### has

```javascript
const { parse, has } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(has(tree, 'VariableDeclaration')) // true
console.log(has(tree, { type: 'VariableDeclaration' })) // true
```

#### count

```javascript
const { parse, count } = require('abstract-syntax-tree')
const source = 'const answer = 42'
const tree = parse(source)
console.log(count(tree, 'VariableDeclaration')) // 1
console.log(count(tree, { type: 'VariableDeclaration' })) // 1
```

#### prepend

```javascript
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

```javascript
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

```javascript
const { equal } = require('abstract-syntax-tree')
console.log(equal({ type: 'Literal', value: 42 }, { type: 'Literal', value: 42 })) // true
console.log(equal({ type: 'Literal', value: 41 }, { type: 'Literal', value: 42 })) // false
````

#### template

```javascript
const { template } = require('abstract-syntax-tree')
const literal = template(42)
const nodes = template('const foo = <%= bar %>;', { bar: { type: 'Literal', value: 1 } })
```

### Instance Methods

Almost all of the static methods (excluding parse, generate, template and equal) have their instance equivalents. There are few extra instance methods:

#### mark

```javascript
const AbstractSyntaxTree = require('abstract-syntax-tree')
const tree = new AbstractSyntaxTree('const a = 1')
tree.mark()
console.log(tree.first('Program').cid) // 1
console.log(tree.first('VariableDeclaration').cid) // 2
```

#### wrap

```javascript
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

```javascript
const AbstractSyntaxTree = require('abstract-syntax-tree')
const source = '(function () { console.log(1); }())'
const tree = new AbstractSyntaxTree(source)
tree.unwrap()
console.log(tree.source) // 'console.log(1);'
```

### Getters

#### type

#### body

#### source

#### map

### Setters

#### body
