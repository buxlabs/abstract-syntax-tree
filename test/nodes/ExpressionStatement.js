const test = require('ava')
const { ExpressionStatement } = require('../..')

test('it sets a correct type', assert => {
  const node = new ExpressionStatement()
  assert.deepEqual(node.type, 'ExpressionStatement')
})

test('it sets expression to null', assert => {
  const node = new ExpressionStatement()
  assert.deepEqual(node.expression, null)
})

test('it assigns options', assert => {
  const node = new ExpressionStatement({
    expression: {
      type: 'Literal',
      value: 'use strict'
    }
  })
  assert.deepEqual(node.expression, { type: 'Literal', value: 'use strict' })
})

