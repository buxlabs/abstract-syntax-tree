const test = require('ava')
const { Directive } = require('../..')

test('it sets a correct type', assert => {
  const node = new Directive()
  assert.deepEqual(node.type, 'Directive')
})
