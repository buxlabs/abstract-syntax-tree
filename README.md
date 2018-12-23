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

## What are abstract syntax trees used for?

They're used e.g. for code's:
- highligthing
- linting
- refactoring
- transformations
- analysis
- minification
- obfuscation
- generation
- source maps

## Installation

`npm install abstract-syntax-tree`

## Key Features

- source to ast conversion
- ast to source generation
- ast traversal
- ast manipulation

## Methods

### find

Find all nodes of given type.

```javascript
const source = 'const a = "x";'
const ast = new AbstractSyntaxTree(source)
ast.find('VariableDeclaration')
```

### each

Iterate over all nodes of given type.

```javascript
const source = 'const a = "x";'
const ast = new AbstractSyntaxTree(source)
ast.each('VariableDeclaration', node => {})
```

### has

Check if ast contains a node of given type.

```javascript
const source = 'const a = "x";'
const ast = new AbstractSyntaxTree(source)
ast.has('VariableDeclaration')
```

### count

Count ast nodes of given type.

```javascript
const source = 'const a = "x"; const b = "y";'
const ast = new AbstractSyntaxTree(source)
ast.count('VariableDeclaration')
```

### first

First first node of given type.

```javascript
const source = 'var a = "x";'
const ast = new AbstractSyntaxTree(source)
ast.first('VariableDeclaration')
```

### last

Find last node of given type.

```javascript
const source = 'const a = "x";'
const ast = new AbstractSyntaxTree(source)
ast.last('VariableDeclaration')
```

### remove

Remove all nodes that match the criteria.

```javascript
const source = '"use strict"; const b = 4;'
const ast = new AbstractSyntaxTree(source)
ast.remove({ type: 'Literal', value: 'use strict' })
```

```javascript
const source = 'function hello () { const foo = "bar"; return "world"; }'
const ast = new AbstractSyntaxTree(source)
ast.remove('BlockStatement > VariableDeclaration')
```

### walk

Walks over all nodes

```javascript
const source = 'const a = 1'
const ast = new AbstractSyntaxTree(source)
ast.walk((node, parent) => {})
```

### traverse

Walks over all nodes

```javascript
const source = 'const a = 1'
const ast = new AbstractSyntaxTree(source)
ast.walk({
  enter (node) {},
  leave (node) {}
})
```

### replace

Replace all nodes that match the criteria.

```javascript
const source = 'const a = 1'
const ast = new AbstractSyntaxTree(source)
ast.replace({
  enter (node) {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'let'
    }
    return node
  }
})
```

### prepend

Prepend a node to the body.

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
ast.prepend({
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'use strict'
  }
})
```

### append

Append a node to the body.

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
ast.append({
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'test'
  }
})
```

### wrap

Wrap body with given node.

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
ast.wrap(body => {
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

### unwrap

Change the code to the first BlockStatement body

```javascript
const source = '(function () { console.log(1); }())'
const ast = new AbstractSyntaxTree(source)
ast.unwrap()
ast.toSource()
```

### template

Create ast partials from templates

```javascript
const source = 'console.log(1);'
const ast = new AbstractSyntaxTree(source)
ast.template('const foo = <%= bar %>;' { bar: { type: 'Literal', value: 1 } })
```

### mark

Add cid to all nodes

```javascript
const ast = new AbstractSyntaxTree('const a = 1;')
ast.mark()
assert(ast.first('Program').cid === 1)
assert(ast.first('VariableDeclaration').cid === 2)
```

### toSource

Convert the ast to string.

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
const source = ast.toSource()
```

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
const { source, map } = ast.toSource({ sourceMap: true })
```

### toSourceMap

Generates a source map.

```javascript
const source = 'const a = 1;'
const ast = new AbstractSyntaxTree(source)
const map = ast.toSourceMap()
```

