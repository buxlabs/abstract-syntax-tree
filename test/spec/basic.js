import test from 'ava'
import AbstractSyntaxTree from '../../index'

test('it works', t => {
  t.truthy(new AbstractSyntaxTree('var x = 0;'))
})

test('it queries the syntax tree', t => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  var declarations = ast.find('VariableDeclaration')
  t.truthy(declarations.length === 1)
})

test('it supports astq for more complex query', t => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  var declarations = ast.find(`
        // VariableDeclarator [
               /:id   Identifier [ @name  ]
            && /:init Literal    [ @value ]
        ]
    `, { engine: 'astq' })
  t.truthy(declarations.length === 1)
})

test('it iterates over found nodes', t => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  ast.each('Literal', node => {
    node.value = 2
  })
  t.truthy(ast.first('Literal').value === 2)
})

test('it checks if node is in the syntax tree', t => {
  var ast = new AbstractSyntaxTree('var z = 2;')
  t.truthy(ast.has('VariableDeclaration'))
})

test('it counts nodes', t => {
  var ast = new AbstractSyntaxTree('var z = 2; var x = 3;')
  t.truthy(ast.count('VariableDeclaration') === 2)
})

test('it returns the source', t => {
  var ast = new AbstractSyntaxTree('var a = 3;')
  t.truthy(ast.toSource() === 'var a = 3;')
})

test('it removes nodes', t => {
  var ast = new AbstractSyntaxTree('"use strict"; var b = 4;')
  ast.remove({ type: 'Literal', value: 'use strict' })
  t.truthy(ast.toSource() === 'var b = 4;')
})

test('it removes function declarations', t => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: 'hello'
    }
  })
  t.truthy(ast.toSource() === 'var a = 1;')
})

test('it keeps variable declarations', t => {
  var source = 'var a = 1, b = 2; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  t.truthy(ast.toSource() === `var b = 2;\nfunction hello() {\n    return 'world';\n}`)
})

test('it removes empty declarations', t => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({
    type: 'VariableDeclarator',
    id: {
      type: 'Identifier',
      name: 'a'
    }
  })
  t.truthy(ast.toSource() === `function hello() {\n    return 'world';\n}`)
})

test('it removes nodes if string is provided', t => {
  var source = 'var a = 1; function hello () { return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('VariableDeclaration')
  t.truthy(ast.toSource() === `function hello() {\n    return 'world';\n}`)
})

test('it removes nodes via complex selectors', t => {
  var source = 'var a = 1; function hello () { var b = 2; return "world"; }'
  var ast = new AbstractSyntaxTree(source)
  ast.remove('BlockStatement > VariableDeclaration')
  t.truthy(ast.toSource() === `var a = 1;\nfunction hello() {\n    return 'world';\n}`)
})

test('it returns the first node', t => {
  var ast = new AbstractSyntaxTree('var a = 1; var b = 2;')
  var declaration = ast.first('VariableDeclaration')
  t.truthy(declaration.declarations[0].id.name === 'a')
})

test('it returns the last node', t => {
  var ast = new AbstractSyntaxTree('var c = 3; var d = 4;')
  var declaration = ast.last('VariableDeclaration')
  t.truthy(declaration.declarations[0].id.name === 'd')
})

test('it works with imports', t => {
  var source = `import _ from 'underscore';`
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.toSource() === source)
})

test('it should be possible to remove the first element only', t => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  ast.remove({ type: 'VariableDeclaration' }, { first: true })
  t.truthy(ast.toSource() === 'var b = 2;')
})

test('it should be possible to beautify the source', t => {
  var source = 'var a = 1; var b = 2;'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.toSource({ beautify: true }) === 'var a = 1;\nvar b = 2;\n')
})

test('it accepts parameters for the beautify method', t => {
  var source = 'var x = "y";'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.toSource({ beautify: { semi: false } }) === 'var x = "y"\n')
})

test('it exposes a static parse method', t => {
  var source = 'var a = 1;'
  var ast = AbstractSyntaxTree.parse(source)
  t.truthy(ast.type === 'Program')
})

test('it supports single line comments', t => {
  var source = '// hello\nvar a = 1;'
  var ast = new AbstractSyntaxTree(source, { comments: true })
  t.truthy(ast.toSource({ comments: true }) === source)
})

test('it supports multi-line comments', t => {
  var source = '/* hello */\nvar a = 1;'
  var ast = new AbstractSyntaxTree(source, { comments: true })
  t.truthy(ast.toSource({ comments: true }) === source)
})

test('it supports different quote types', t => {
  var source = `var a = 'hello';`
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.toSource({ quotes: 'double' }) === `var a = "hello";`)
})

test('it prepends a node to body', t => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.prepend({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  t.truthy(ast.toSource() === '\'use strict\';\nvar a = 1;')
})

test('it appends a node to body', t => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.append({
    type: 'ExpressionStatement',
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  t.truthy(ast.toSource() === 'var a = 1;\n\'use strict\';')
})

test('it compares nodes', t => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.is({ type: 'ReturnStatement' }, { type: 'ReturnStatement' }))
})

test('it walks through nodes', t => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.walk(node => {
    if (node.type === 'VariableDeclaration') {
      node.kind = 'let'
    }
    return node
  })
  t.truthy(ast.toSource() === 'let a = 1;')
})

test('it exposes a traverse method', t => {
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
  t.truthy(ast.toSource() === 'let a = 1;')
})

test('it replaces nodes', t => {
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
  t.truthy(ast.toSource() === 'let a = 1;')
})

test('it has a toString alias for toSource', t => {
  var ast = new AbstractSyntaxTree('var y = 1;')
  t.truthy(ast.toString() === 'var y = 1;')
})

test('it allows to override the beautify method', t => {
  var source = 'var a = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.beautify = function (source) {
    return source + '\n'
  }
  t.truthy(ast.toSource({ beautify: true }) === 'var a = 1;\n')
})

test('it has a minify noop method by default', t => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.toSource({ minify: true }) === 'var hello = 1;')
})

test('it allows to override the minify method', t => {
  var source = 'var hello = 1;'
  var ast = new AbstractSyntaxTree(source)
  ast.minify = function (ast) {
    ast.body[0].declarations[0].id.name = 'a'
    return ast
  }
  t.truthy(ast.toSource({ minify: true }) === 'var a = 1;')
})

test('it wraps the code', t => {
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
  t.truthy(ast.toSource().replace(/\s/g, '') === '(function(){vara=1;}());')
})

test('it unwraps the code in case of iife', t => {
  var source = '(function () { console.log(1); }());'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  t.truthy(ast.toSource() === 'console.log(1);')
})

test('it unwraps code in case of amd', t => {
  var source = 'define(function () { console.log(1); });'
  var ast = new AbstractSyntaxTree(source)
  ast.unwrap()
  t.truthy(ast.toSource() === 'console.log(1);')
})

test('it generates ast from templates', t => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.template('"use strict";')[0].type === 'ExpressionStatement')
})

test('it generates ast from templates with parameters', t => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('it generates ast from literals', t => {
  var source = 'console.log(1);'
  var ast = new AbstractSyntaxTree(source)
  t.truthy(ast.template(1).type === 'Literal')
})
