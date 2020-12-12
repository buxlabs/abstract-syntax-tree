const test = require('ava')
const { serialize } = require('../..')

test('serialize: Map', assert => {
  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Map'
    },
    arguments: []
  }), new Map())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Map'
    },
    arguments: [
      {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'key1' },
          { type: 'Literal', value: 'value1' }
        ]
      },
      {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 'key2' },
          { type: 'Literal', value: 'value2' }
        ]
      }
    ]
  }), new Map([
    ['key1', 'value1'],
    ['key2', 'value2']
  ]))
})
