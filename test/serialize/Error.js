const test = require('ava')
const { serialize } = require('../..')

test('serialize: Error', assert => {
  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'Error'
    },
    arguments: []
  }), new Error())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'EvalError'
    },
    arguments: []
  }), new EvalError())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'RangeError'
    },
    arguments: []
  }), new RangeError())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'ReferenceError'
    },
    arguments: []
  }), new ReferenceError())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'SyntaxError'
    },
    arguments: []
  }), new SyntaxError())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'TypeError'
    },
    arguments: []
  }), new TypeError())

  assert.deepEqual(serialize({
    type: 'NewExpression',
    callee: {
      type: 'Identifier',
      name: 'URIError'
    },
    arguments: []
  }), new URIError())
})
