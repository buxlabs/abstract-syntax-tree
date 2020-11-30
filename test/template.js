const test = require('ava')
const { template, generate } = require('..')

function convert (obj) {
  return generate(template(obj))
}

test('template: from string', assert => {
  assert.truthy(template('"use strict";')[0].type === 'ExpressionStatement')
})

test('template: from string with params', assert => {
  assert.truthy(template('var x = <%= value %>;', { value: { type: 'Literal', value: 1 } })[0].declarations[0].init.value === 1)
})

test('template: from undefined and null', assert => {
  assert.deepEqual(convert(undefined), 'void 0')
  assert.deepEqual(convert(null), 'null')
})

test('template: from numbers', assert => {
  assert.deepEqual(convert(NaN), 'NaN')
  assert.deepEqual(convert(Infinity), 'Infinity')
  assert.deepEqual(convert(1), '1')
  assert.deepEqual(convert(-1), '-1')
  assert.deepEqual(convert(0xffff), '65535')
})

test('template: from functions', assert => {
  assert.deepEqual(convert(function () { return 2 }), 'function () {\n  return 2;\n}')
  assert.deepEqual(convert(String.prototype.trim), 'null')
})

test('template: from arrays', assert => {
  // assert.deepEqual(convert([], '[]'))
  assert.deepEqual(convert([1, 2, 3]), '[1, 2, 3]')
  assert.deepEqual(convert(['foo', 'bar']), '["foo", "bar"]')
  assert.deepEqual(convert([1, null, 'test', -1, undefined, NaN]), '[1, null, "test", -1, void 0, NaN]')
})

test('template: from wrapper objects for literals', assert => {
  assert.deepEqual(convert(new String('hi')), 'new String("hi")')
  assert.deepEqual(convert(new Boolean(true)), 'new Boolean(true)')
  assert.deepEqual(convert(new Number(2)), 'new Number(2)')
  assert.deepEqual(convert(new Number(-2)), 'new Number(-2)')
})

test('template: from typed arrays', assert => {
  assert.deepEqual(convert(new Uint8Array([1, 2, 3])), 'new Uint8Array([1, 2, 3])')
  assert.deepEqual(convert(new Uint8ClampedArray([1, 2, 3])), 'new Uint8ClampedArray([1, 2, 3])')
  assert.deepEqual(convert(new Int8Array([1, 2, 3])), 'new Int8Array([1, 2, 3])')
  assert.deepEqual(convert(new Uint16Array([1, 2, 3])), 'new Uint16Array([1, 2, 3])')
  assert.deepEqual(convert(new Int16Array([1, 2, 3])), 'new Int16Array([1, 2, 3])')
  assert.deepEqual(convert(new Uint32Array([1, 2, 3])), 'new Uint32Array([1, 2, 3])')
  assert.deepEqual(convert(new Int32Array([1, 2, 3])), 'new Int32Array([1, 2, 3])')
  assert.deepEqual(convert(new Float32Array([1, 2, 3])), 'new Float32Array([1, 2, 3])')
  assert.deepEqual(convert(new Float64Array([1, 2, 3])), 'new Float64Array([1, 2, 3])')
})

test('template: from array buffers', assert => {
  assert.deepEqual(convert(new ArrayBuffer(10)), 'new ArrayBuffer(10)')
  assert.deepEqual(convert(new Uint8Array([0, 0, 0]).buffer), 'new ArrayBuffer(3)')
  assert.deepEqual(convert(new Uint8Array([1, 2, 3]).buffer), 'new Uint8Array([1, 2, 3]).buffer')
})

test('template: from dates', assert => {
  assert.deepEqual(convert(new Date(1427942885076)), 'new Date("2015-04-02T02:48:05.076Z")')
  assert.deepEqual(convert(new Date(NaN)), 'new Date(NaN)')
})

test('template: from errors', assert => {
  assert.deepEqual(convert(new Error('hi')), 'new Error("hi")')
  assert.deepEqual(convert(new TypeError('yo')), 'new TypeError("yo")')
})

test('template: from regular expressions', assert => {
  assert.deepEqual(convert(/[abc]+/i), '/[abc]+/i')
  assert.deepEqual(convert(new RegExp('[abc]+', 'gi')), '/[abc]+/ig')
})

test('template: from normal objects', assert => {
  assert.deepEqual(convert({}), '{}')
  assert.deepEqual(convert({ foo: 2, bar: 'hi', baz: [1, 2, 3], yo: { b: 2 } }), '{\n  "foo": 2,\n  "bar": "hi",\n  "baz": [1, 2, 3],\n  "yo": {\n    "b": 2\n  }\n}')

  function fn () {
    this.x = 2
    this.y = 5
  }

  fn.prototype.z = 5

  assert.deepEqual(convert(new fn()), '{\n  "x": 2,\n  "y": 5\n}')
})

test('uses custom toAST method when available', assert => {
  assert.deepEqual(convert({
    toAST: function () {
      return { type: 'Literal', value: 2 }
    }
  }), '2')
})
