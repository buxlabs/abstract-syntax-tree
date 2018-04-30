import test from 'ava'
import AbstractSyntaxTree from '../../index'

test('it works', assert => {
  assert.truthy(new AbstractSyntaxTree('var x = 0;'))
})

test('it accepts abstract syntax tree', assert => {
  assert.truthy(new AbstractSyntaxTree([{
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
  assert.truthy(ast.toSource() === 'var a = 3;')
})

test('it removes nodes', assert => {
  var ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  assert.truthy(ast.toSource() === 'var b = 4;')
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
  assert.truthy(ast.toSource() === 'var a = 1;')
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
  assert.truthy(ast.toSource() === `var b = 2;\nfunction hello() {\n    return 'world';\n}`)
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
  assert.truthy(ast.toSource() === `function hello() {\n    return 'world';\n}`)
})

test('it removes nodes if string is provided', assert => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  assert.truthy(ast.toSource() === `function hello() {\n    return 'world';\n}`)
})

test('it removes nodes via complex selectors', assert => {
  var source = 'var a = 1; function hello () { var b = 2; return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('BlockStatement > VariableDeclaration')
  assert.truthy(ast.toSource() === `var a = 1;\nfunction hello() {\n    return 'world';\n}`)
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
  var source = `import _ from 'underscore';`
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.toSource() === source)
})

test('it should be possible to remove the first element only', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({ type: 'VariableDeclaration' }, { first: true })
  assert.truthy(ast.toSource() === 'var b = 2;')
})

test('it should be possible to beautify the source', assert => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.toSource({ beautify: true }) === 'var a = 1;\nvar b = 2;\n')
})

test('it accepts parameters for the beautify method', assert => {
  var source = 'var x = "y";'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.toSource({ beautify: { semi: false } }) === 'var x = "y"\n')
})

test('it supports different quote types', assert => {
  var source = `var a = 'hello';`
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.toSource({ quotes: 'double' }) === `var a = "hello";`)
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
  assert.truthy(ast.toSource() === '\'use strict\';\nvar a = 1;')
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
  assert.truthy(ast.toSource() === 'var a = 1;\n\'use strict\';')
})

test('it compares nodes', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.is({ type: 'ReturnStatement' }, { type: 'ReturnStatement' }))
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
  assert.truthy(ast.toSource() === 'let a = 1;')
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
  assert.truthy(ast.toSource() === 'let a = 1;')
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
  assert.truthy(ast.toSource() === 'let a = 1;')
})

test('it has a toString alias for toSource', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  assert.truthy(ast.toString() === 'var y = 1;')
})

test('it allows to override the beautify method', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.beautify = function (source) {
    return source + '\n'
  }
  assert.truthy(ast.toSource({ beautify: true }) === 'var a = 1;\n')
})

test('it has a minify noop method by default', assert => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.toSource({ minify: true }) === 'var hello = 1;')
})

test('it allows to override the minify method', assert => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.minify = function (ast) {
    ast.body[0].declarations[0].id.name = 'a'
    return ast
  }
  assert.truthy(ast.toSource({ minify: true }) === 'var a = 1;')
})

test('it wraps the code', assert => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.wrap(body => {
    return [
      {
        'type': 'ExpressionStatement',
        'expression': {
          'type': 'CallExpression',
          'callee': {
            'type': 'FunctionExpression',
            'id': null,
            'params': [],
            'defaults': [],
            'body': {
              'type': 'BlockStatement',
              'body': body
            },
            'rest': null,
            'generator': false,
            'expression': false
          },
          'arguments': []
        }
      }
    ]
  })
  assert.truthy(ast.toSource().replace(/\s/g, '') === '(function(){vara=1;}());')
})

test('it unwraps the code in case of iife', assert => {
  var source = '(function () { console.log(1); }());'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.truthy(ast.toSource() === 'console.log(1);')
})

test('it unwraps code in case of amd', assert => {
  var source = 'define(function () { console.log(1); });'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  assert.truthy(ast.toSource() === 'console.log(1);')
})

test('it generates ast from templates', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.template('"use strict";')[0].type === 'ExpressionStatement')
})

test('it generates ast from templates with parameters', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('it generates ast from literals', assert => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  assert.truthy(ast.template(1).type === 'Literal')
})

test('it generates sourcemaps', assert => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  assert.truthy(ast.first('Literal').value === 2)
  const { source, map } = ast.toSource({ sourceMap: true })
  assert.truthy(source)
  assert.truthy(map)
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
