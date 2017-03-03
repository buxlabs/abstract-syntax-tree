# @buxlabs/ast - AbstractSyntaxTree

You might find the class useful if you want to abstract away some ast manipulations such as adding, removing, replacing the nodes and others. The test folder is a good starting point for examples of usage. PRs are highly welcome.

## Installation

`npm install --save @buxlabs/ast`

## Methods

### has

```javascript
  var source = 'var a = "x";';
  var ast = new AbstractSyntaxTree(source);
  ast.has('VariableDeclaration'); // true
```

### find

```javascript
  var source = 'var a = "x";';
  var ast = new AbstractSyntaxTree(source);
  ast.find('VariableDeclaration'); // [ { ... } ]
```

### first

```javascript
  var source = 'var a = "x";';
  var ast = new AbstractSyntaxTree(source);
  ast.first('VariableDeclaration'); // { ... }
```

### last

```javascript
  var source = 'var a = "x";';
  var ast = new AbstractSyntaxTree(source);
  ast.last('VariableDeclaration'); // { ... }
```

### remove

```javascript
  var source = '"use strict"; var b = 4;';
  var ast = new AbstractSyntaxTree(source);
  ast.remove({ type: 'Literal', value: 'use strict' });
```

### replace

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

### prepend / append

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

### toSource

```javascript
  var source = 'var a = 1;';
  var ast = new AbstractSyntaxTree(source);
  ast.toSource(); // 'var a = 1;';
```
