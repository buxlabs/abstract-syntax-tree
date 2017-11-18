# AbstractSyntaxTree

[![Codeship](https://img.shields.io/codeship/b5a42860-956a-0135-6dcd-229add4b057c/master.svg)]() [![Build Status](https://travis-ci.org/buxlabs/ast.svg?branch=master)](https://travis-ci.org/buxlabs/ast) [![NSP Status](https://nodesecurity.io/orgs/buxlabs/projects/4b0bfe3e-43d0-4597-b407-dd44cec2f3d6/badge)](https://nodesecurity.io/orgs/buxlabs/projects/4b0bfe3e-43d0-4597-b407-dd44cec2f3d6)

You might find the class useful if you want to abstract away some ast manipulations such as adding, removing, replacing the nodes and others. The test folder is a good starting point for examples of usage. PRs are highly welcome.

## Installation

`npm install --save @buxlabs/ast`

## Methods

### has

Check if ast contains a node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.has('VariableDeclaration');
```

### count

Count ast nodes of given type.

```javascript
var source = 'var a = "x"; var b = "y";';
var ast = new AbstractSyntaxTree(source);
ast.count('VariableDeclaration');
```

### find

Find all nodes of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.find('VariableDeclaration');
```

### each

Iterate over all nodes of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.each('VariableDeclaration', node => {
  console.log(node);
});
```

### first

First first node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.first('VariableDeclaration');
```

### last

Find last node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.last('VariableDeclaration');
```

### remove

Remove all nodes that match the criteria.

```javascript
var source = '"use strict"; var b = 4;';
var ast = new AbstractSyntaxTree(source);
ast.remove({ type: 'Literal', value: 'use strict' });
```

```javascript
var source = 'function hello () { var foo = "bar"; return "world"; }';
var ast = new AbstractSyntaxTree(source);
ast.remove('BlockStatement > VariableDeclaration');
```

### walk

Walks over all nodes

```javascript
var source = 'var a = 1';
var ast = new AbstractSyntaxTree(source);
ast.walk((node, parent) => {
  console.log(node, parent); 
});
```

### traverse

Walks over all nodes

```javascript
var source = 'var a = 1';
var ast = new AbstractSyntaxTree(source);
ast.walk({
  enter: function (node) {
    console.log(node);
  },
  leave: function (node) {
    console.log(node);
  }
});
```

### replace

Replace all nodes that match the criteria.

```javascript
var source = 'var a = 1';
var ast = new AbstractSyntaxTree(source);
ast.replace({
  enter: function (node) {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'let';
    }
    return node;
  }
});
```

### prepend

Prepend a node to the body.

```javascript
var source = 'var a = 1;';
var ast = new AbstractSyntaxTree(source);
ast.prepend({
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'use strict'
  }
});
```

### append

Append a node to the body.

```javascript
var source = 'var a = 1;';
var ast = new AbstractSyntaxTree(source);
ast.append({
  type: 'ExpressionStatement',
  expression: {
    type: 'Literal',
    value: 'test'
  }
});
```

### wrap

Wrap body with given node.

```javascript
var source = 'var a = 1;';
var ast = new AbstractSyntaxTree(source);
ast.wrap(body => {
    return [
      {
        "type": "ExpressionStatement",
        "expression": {
          "type": "CallExpression",
          "callee": {
            "type": "FunctionExpression",
            "id": null,
            "params": [],
            "defaults": [],
            "body": {
              "type": "BlockStatement",
              "body": body
            },
            "rest": null,
            "generator": false,
            "expression": false
          },
          "arguments": []
        }
      }
    ];
});
```

### unwrap

Change the code to the first BlockStatement body

```javascript
var source = '(function () { console.log(1); }())';
var ast = new AbstractSyntaxTree(source);
ast.unwrap();
ast.toSource();
```

### template

Create ast partials from templates

```javascript
var source = 'console.log(1);';
var ast = new AbstractSyntaxTree(source);
ast.template('var foo = <%= bar %>;' { bar: { type: 'Literal', value: 1 } });
```

### toSource / toString

Convert the ast to string.

```javascript
var source = 'var a = 1;';
var ast = new AbstractSyntaxTree(source);
ast.toSource();
```
