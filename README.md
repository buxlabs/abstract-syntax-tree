# AbstractSyntaxTree

You might find the class useful if you want to abstract away some ast manipulations such as adding, removing, replacing the nodes and others. The test folder is a good starting point for examples of usage.

## methods

### has

```javascript
  const ast = new AbstractSyntaxTree('var a = "x";');
  ast.has('VariableDeclaration'); // true
```

### find

```javascript
  const ast = new AbstractSyntaxTree('var a = "x";');
  ast.find('VariableDeclaration'); // [ { ... } ]
```

### first

```javascript
  const ast = new AbstractSyntaxTree('var a = "x";');
  ast.first('VariableDeclaration'); // { ... }
```

### last

```javascript
  const ast = new AbstractSyntaxTree('var a = "x";');
  ast.last('VariableDeclaration'); // { ... }
```

### remove

### replace

### prepend

### append

### toSource
