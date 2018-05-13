const assert = require('assert')

module.exports = async function (description, callback) {
  try {
    await callback(assert)
  } catch (exception) {
    console.error(exception)
    console.log(`Test failed: ${description}`)
  }
}
