const test = require('ava')
const { serialize } = require('../..')

test('serialize: Array', assert => {
  assert.deepEqual(serialize({
    type: 'ArrayExpression',
    elements: [
      { type: 'Literal', value: 1 },
      { type: 'Literal', value: 2 },
      { type: 'Literal', value: 3 },
      { type: 'Literal', value: 4 },
      { type: 'Literal', value: 5 }
    ]
  }), [1, 2, 3, 4, 5])

  assert.deepEqual(serialize({
    type: 'ArrayExpression',
    elements: [
      { type: 'Literal', value: 1 },
      { type: 'Literal', value: 2 },
      {
        type: 'ArrayExpression',
        elements: [
          { type: 'Literal', value: 3 }
        ]
      }
    ]
  }), [1, 2, [3]])

  assert.deepEqual(serialize({
    type: 'ArrayExpression',
    elements: [
      {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'Property',
            key: { type: 'Identifier', name: 'foo' },
            value: {
              type: 'ObjectExpression',
              properties: [
                {
                  type: 'Property',
                  key: { type: 'Identifier', name: 'bar' },
                  value: { type: 'Literal', value: 42 }
                }
              ]
            }
          }
        ]
      }
    ]
  }), [{ foo: { bar: 42 } }])
})
