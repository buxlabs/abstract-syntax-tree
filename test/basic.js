const test = require('./helpers/test')
const AbstractSyntaxTree = require('..')

test('it accepts source', assert => {
  assert.truthy(new AbstractSyntaxTree('var x = 0;'))
})

test('it accepts abstract syntax tree', assert => {
  assert.truthy(new AbstractSyntaxTree({
    type: 'Program',
    body: [
      {
        type: 'FunctionDeclaration',
        id: { 'type': 'Identifier', 'name': 'foo' },
        params: [],
        body: { 'type': 'BlockStatement', 'body': [] }
      }
    ]
  }))
})

test('it queries the syntax tree', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  var declarations = ast.find('VariableDeclaration')
  assert.truthy(declarations.length === 1)
})

test('it iterates over found nodes', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  assert.truthy(ast.first('Literal').value === 2)
})

test('it checks if node is in the syntax tree', assert => {
  var ast = new AbstractSyntaxTree('var z = 2;')
  assert.truthy(ast.has('VariableDeclaration'))
})

test('it counts nodes', assert => {
  var ast = new AbstractSyntaxTree('var z = 2; var x = 3;')
  assert.truthy(ast.count('VariableDeclaration') === 2)
})

test('it returns the source', assert => {
  var ast = new AbstractSyntaxTree('var a = 3;')
  assert.truthy(ast.source === 'var a = 3;\n')
})

test('it removes nodes', assert => {
  var ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  assert.truthy(ast.source === 'var b = 4;\n')
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
  assert.truthy(ast.source === 'var a = 1;\n')
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
  assert.truthy(ast.source === 'var b = 2;\nfunction hello() {\n  return "world";\n}\n')
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
  assert.truthy(ast.source === 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes if string is provided', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  assert.deepEqual(ast.source, 'function hello() {\n  return "world";\n}\n')
})

test('it removes nodes via complex selectors', assert => {
  var source = 'var a = 1; function hello () { var b = 2; return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('BlockStatement > VariableDeclaration')
  assert.deepEqual(ast.source, `var a = 1;\nfunction hello() {\n  return "world";\n}\n`)
})

test('it returns the first node', assert => {
  var ast = new AbstractSyntaxTree('var a = 1; var b = 2;')
  var declaration = ast.first('VariableDeclaration')
  assert.truthy(declaration.declarations[0].id.name === 'a')
})

test('it returns the last node', assert => {
  var ast = new AbstractSyntaxTree('var c = 3; var d = 4;')
  var declaration = ast.last('VariableDeclaration')
  assert.truthy(declaration.declarations[0].id.name === 'd')
})

test('it works with imports', assert => {
  var source = 'import foo from "bar";'
  var ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.source, source + '\n')
})

test('it should be possible to remove the first element only', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({ type: 'VariableDeclaration' }, { first: true })
  assert.truthy(ast.source === 'var b = 2;\n')
})

test('it supports double quotes by default', assert => {
  var source = `var a = 'hello';`
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.source === `var a = "hello";\n`)
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
  assert.deepEqual(ast.source, 'let a = 1;\n')
})

test('it has a toString alias for toSource', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  assert.truthy(ast.source === 'var y = 1;\n')
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
  assert.deepEqual(ast.source.replace(/\s/g, ''), '(function(){vara=1;})();')
})

test('it unwraps the code in case of iife', assert => {
  var source = '(function () { console.log(1); }());'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.truthy(ast.source === 'console.log(1);\n')
})

test('it unwraps code in case of amd', assert => {
  var source = 'define(function () { console.log(1); });'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.truthy(ast.source === 'console.log(1);\n')
})

test('it returns the type', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.deepEqual(ast.type, 'Program')
})

test('it returns the body', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.body)
})

test('it generates sourcemaps', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  assert.truthy(ast.first('Literal').value === 2)
  assert.deepEqual(ast.map, '{"version":3,"sources":["UNKNOWN"],"names":["y"],"mappings":"IAAIA,IAAI","file":"UNKNOWN"}')
})

test('it lets you mark nodes', assert => {
  var ast = new AbstractSyntaxTree('var a = 1;')
  ast.mark()
  assert.truthy(ast.first('Program').cid === 1)
  assert.truthy(ast.first('VariableDeclaration').cid === 2)
  assert.truthy(ast.first('VariableDeclarator').cid === 3)
  assert.truthy(ast.first('Identifier').cid === 4)
  assert.truthy(ast.first('Literal').cid === 5)
})
