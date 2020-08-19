const test = require('ava')
const { CatchClause } = require('../..')

test('it sets a correct type', assert => {
  const node = new CatchClause()
  assert.deepEqual(node.type, 'CatchClause')
})
