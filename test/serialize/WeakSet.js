const test = require('ava')
const { serialize } = require('../..')

test('serialize: WeakSet', assert => {
  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'WeakSet'
    },
    arguments: []
  }), new WeakSet())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'WeakSet'
    },
    arguments: [
      { type: 'ObjectExpression', properties: [] }
    ]
  }), new WeakSet([{}]))
})
