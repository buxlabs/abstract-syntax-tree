# AbstractSyntaxTree

You might find the class useful if you want to abstract away some ast manipulations such as adding, removing, replacing the nodes and others. The test folder is a good starting point for examples of usage. PRs are highly welcome.

- [x] 100% coverage

## Installation

`npm install --save @buxlabs/ast`

## Methods

### has

Check if ast contains a node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.has('VariableDeclaration'); // true
```

### count

Count ast nodes of given type.

```javascript
var source = 'var a = "x"; var b = "y";';
var ast = new AbstractSyntaxTree(source);
ast.count('VariableDeclaration'); // 2
```

### find

Find all nodes of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.find('VariableDeclaration'); // [ { ... } ]
```

### first

First first node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.first('VariableDeclaration'); // { ... }
```

### last

Find last node of given type.

```javascript
var source = 'var a = "x";';
var ast = new AbstractSyntaxTree(source);
ast.last('VariableDeclaration'); // { ... }
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
ast.toSource(); // 'console.log(1);'
```

### template

Create ast partials from templates

```javascript
var source = 'console.log(1);';
var ast = new AbstractSyntaxTree(source);
ast.template('var foo = <%= bar %>;' { bar: { type: 'Literal', value: 1 } }); // [ { type: 'VariableDeclaration', declarations: [...] } ]
```

### toSource

Convert the ast to string.

```javascript
var source = 'var a = 1;';
var ast = new AbstractSyntaxTree(source);
ast.toSource(); // 'var a = 1;';
```
