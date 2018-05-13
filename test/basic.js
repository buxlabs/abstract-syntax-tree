const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it works', assert => {
  assert.ok(new AbstractSyntaxTree('var x = 0;'))
})

test('it accepts abstract syntax tree', assert => {
  assert.ok(new AbstractSyntaxTree([{
    type: 'Program',
    body: [
      {
        type: 'FunctionDeclaration',
        id: { 'type': 'Identifier', 'name': 'foo' },
        params: [],
        body: { 'type': 'BlockStatement', 'body': [] }
      }
    ]
  }]))
})

test('it queries the syntax tree', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  var declarations = ast.find('VariableDeclaration')
  assert.ok(declarations.length === 1)
})

test('it iterates over found nodes', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  assert.ok(ast.first('Literal').value === 2)
})

test('it checks if node is in the syntax tree', assert => {
  var ast = new AbstractSyntaxTree('var z = 2;')
  assert.ok(ast.has('VariableDeclaration'))
})

test('it counts nodes', assert => {
  var ast = new AbstractSyntaxTree('var z = 2; var x = 3;')
  assert.ok(ast.count('VariableDeclaration') === 2)
})

test('it returns the source', assert => {
  var ast = new AbstractSyntaxTree('var a = 3;')
  assert.ok(ast.toSource() === 'var a = 3;\n')
})

test('it removes nodes', assert => {
  var ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  assert.ok(ast.toSource() === 'var b = 4;\n')
})

test('it removes function declarations', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: 'hello'
    }
  })
  assert.ok(ast.toSource() === 'var a = 1;\n')
})

test('it keeps variable declarations', assert => {
  var source = 'var a = 1, b = 2; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  assert.ok(ast.toSource() === 'var b = 2;\nfunction hello() {\n  return "world";\n}\n')
})

test('it removes empty declarations', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  assert.ok(ast.toSource() === 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes if string is provided', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  assert.deepEqual(ast.toSource(), 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes via complex selectors', assert => {
  var source = 'var a = 1; function hello () { var b = 2; return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('BlockStatement > VariableDeclaration')
  assert.deepEqual(ast.toSource(), `var a = 1;\nfunction hello() {\n  return "world";\n}\n`)
})

test('it returns the first node', assert => {
  var ast = new AbstractSyntaxTree('var a = 1; var b = 2;')
  var declaration = ast.first('VariableDeclaration')
  assert.ok(declaration.declarations[0].id.name === 'a')
})

test('it returns the last node', assert => {
  var ast = new AbstractSyntaxTree('var c = 3; var d = 4;')
  var declaration = ast.last('VariableDeclaration')
  assert.ok(declaration.declarations[0].id.name === 'd')
})

test('it works with imports', assert => {
  var source = 'import foo from "bar";'
  var ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.toSource(), source + '\n')
})

test('it should be possible to remove the first element only', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({ type: 'VariableDeclaration' }, { first: true })
  assert.ok(ast.toSource() === 'var b = 2;\n')
})

test('it should be possible to beautify the source', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.toSource({ beautify: true }) === 'var a = 1;\nvar b = 2;\n')
})

test('it accepts parameters for the beautify method', assert => {
  var source = 'var x = "y";'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.toSource({ beautify: { semi: false } }) === 'var x = "y"\n')
})

test('it supports double quotes by default', assert => {
  var source = `var a = 'hello';`
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.toSource() === `var a = "hello";\n`)
})

test('it prepends a node to body', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.prepend({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(ast.toSource(), '"use strict";\nvar a = 1;\n')
})

test('it appends a node to body', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.append({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(ast.toSource(), 'var a = 1;\n"use strict";\n')
})

test('it compares nodes', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.is({ type: 'ReturnStatement' }, { type: 'ReturnStatement' }))
})

test('it walks through nodes', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.walk(node => {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'let'
    }
    return node
  })
  assert.deepEqual(ast.toSource(), 'let a = 1;\n')
})

test('it exposes a traverse method', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.traverse({
    enter: function (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'let'
      }
      return node
    }
  })
  assert.deepEqual(ast.toSource(), 'let a = 1;\n')
})

test('it replaces nodes', assert => {
  var source = 'var a = 1'
  var ast = new AbstractSyntaxTree(source)
  ast.replace({
    enter: function (node) {
      if (node.type === 'VariableDeclaration') {
        node.kind = 'let'
      }
      return node
    }
  })
  assert.deepEqual(ast.toSource(), 'let a = 1;\n')
})

test('it has a toString alias for toSource', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  assert.ok(ast.toString() === 'var y = 1;\n')
})

test('it allows to override the beautify method', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.beautify = function (source) {
    return source + '\n'
  }
  assert.deepEqual(ast.toSource({ beautify: true }), 'var a = 1;\n\n')
})

test('it has a minify noop method by default', assert => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.toSource({ minify: true }), 'var hello = 1;\n')
})

test('it allows to override the minify method', assert => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.minify = function (ast) {
    ast.body[0].declarations[0].id.name = 'a'
    return ast
  }
  assert.deepEqual(ast.toSource({ minify: true }), 'var a = 1;\n')
})

test('it wraps the code', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.wrap(body => {
    return [
      {
        type: 'ExpressionStatement',
        expression: {
          type: 'CallExpression',
          callee: {
            type: 'FunctionExpression',
            id: null,
            params: [],
            defaults: [],
            body: {
              type: 'BlockStatement',
              body
            },
            rest: null,
            generator: false,
            expression: false
          },
          arguments: []
        }
      }
    ]
  })
  assert.deepEqual(ast.toSource().replace(/\s/g, ''), '(function(){vara=1;})();')
})

test('it unwraps the code in case of iife', assert => {
  var source = '(function () { console.log(1); }());'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.ok(ast.toSource() === 'console.log(1);\n')
})

test('it unwraps code in case of amd', assert => {
  var source = 'define(function () { console.log(1); });'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.ok(ast.toSource() === 'console.log(1);\n')
})

test('it returns the body', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.body() === ast.ast.body)
})

test('it generates ast from templates', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.template('"use strict";')[0].type === 'ExpressionStatement')
})

test('it generates ast from templates with parameters', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('it generates ast from literals', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.ok(ast.template(1).type === 'Literal')
})

test('it generates sourcemaps', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  assert.ok(ast.first('Literal').value === 2)
  const { source, map } = ast.toSource({ sourceMap: true })
  assert.ok(source)
  assert.deepEqual(map, '{"version":3,"sources":["UNKNOWN"],"names":["y"],"mappings":"IAAIA,IAAI","file":"UNKNOWN"}')
})

test('it lets you mark nodes', assert => {
  var ast = new AbstractSyntaxTree('var a = 1;')
  ast.mark()
  assert.ok(ast.first('Program').cid === 1)
  assert.ok(ast.first('VariableDeclaration').cid === 2)
  assert.ok(ast.first('VariableDeclarator').cid === 3)
  assert.ok(ast.first('Identifier').cid === 4)
  assert.ok(ast.first('Literal').cid === 5)
})
