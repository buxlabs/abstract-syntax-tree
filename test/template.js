const test = require('ava')
const { template } = require('..')

test('template: from string', assert => {
  assert.truthy(template('"use strict";')[0].type === 'ExpressionStatement')
})

test('template: from string with params', assert => {
  assert.truthy(template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('template: from numbers', assert => {
  assert.truthy(template(1).type === 'Literal')
})
