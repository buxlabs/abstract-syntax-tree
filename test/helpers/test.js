const assert = require('assert')

async function test (description, callback) {
  try {
    await callback(assert)
  } catch (exception) {
    console.error(exception)
    console.log(`Test failed: ${description}`)
  }
}

test.skip = function () {}

module.exports = test
