const test = require('../helpers/test')
const { Suite } = require('benchmark')
const AbstractSyntaxTree = require('..')

test('it favors inline code over template method usage in hot paths if not memoized', assert => {
  let ast = new AbstractSyntaxTree('console.log(1);')
  let suite = new Suite()
  suite
    .add('template#string', function () {
      return ast.template('var add = function (a, b) { return a + b; }')
    })
    .add('template#expression', function () {
      return ast.template('var add = <%= fn %>', { fn: ast.template(function (a, b) { return a + b }) })
    })
    .add('template#inline', function () {
      return [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'add' },
        init: ast.template(function (a, b) { return a + b })
      }]
    })
    .on('complete', function () {
      assert.ok(this.filter('fastest').map('name')[0] === 'template#inline')
    })
    .run({ 'async': true })
})
