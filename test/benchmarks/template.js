const test = require('../helpers/test')
const { Suite } = require('benchmark')
const { template } = require('../..')

test.cb('it favors inline code over template method usage in hot paths if not memoized', assert => {
  const suite = new Suite()
  suite
    .add('template#string', function () {
      return template('var add = function (a, b) { return a + b; }')
    })
    .add('template#expression', function () {
      return template('var add = <%= fn %>', { fn: template(function (a, b) { return a + b }) })
    })
    .add('template#inline', function () {
      return [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'add' },
        init: template(function (a, b) { return a + b })
      }]
    })
    .on('complete', function () {
      assert.truthy(this.filter('fastest').map('name')[0] === 'template#inline')
      assert.end()
    })
    .run({ async: true })
})
