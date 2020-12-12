const test = require('ava')
const { serialize } = require('../..')

test('serialize: Set', assert => {
  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Set'
    },
    arguments: []
  }), new Set())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Set'
    },
    arguments: [
      { type: 'Literal', value: 1 },
      { type: 'Literal', value: 2 },
      { type: 'Literal', value: 3 }
    ]
  }), new Set([1, 2, 3]))
})
