const test = require('ava')
const { equal } = require('..')

const object = {
  key1: 1,
  key2: '2',
  keyNull: null,
  deep: {
    key3: 3
  },
  veryDeep: {
    value: {
      key4: 4
    }
  },
  many: [1, '2']
}

const email = {
  from: 'tester@example.com',
  to: ['myfriend@example.com', 'boss@example.com'],
  subject: 'My Email',
  body: 'Hello,\nI will be on vacation for the rest of the year.\n\nThanks!'
}

test('equal: returns true for two exact nodes', assert => {
  assert.truthy(equal({ type: 'ReturnStatement' }, { type: 'ReturnStatement' }))
})

test('equal: checks simple keys', assert => {
  assert.truthy(equal(object, { key1: 1 }))
  assert.truthy(equal(object, { keyNull: null }))
  assert.falsy(equal(object, { key1: 0 }, true))
  assert.falsy(equal(object, { keyNull: 1 }))
})

test('equal: checks dot-notation keys', assert => {
  assert.truthy(equal(object, { 'deep.key3': 3 }))
  assert.falsy(equal(object, { 'deep.key3': 4 }))
})

test('equal: checks multiple keys', assert => {
  assert.truthy(equal(object, { key1: 1, key2: '2' }))
  assert.falsy(equal(object, { key1: 1, key2: '3' }))
})

test('equal: checks mixed simple and nested keys', assert => {
  assert.truthy(equal(object, { 'deep.key3': 3, key1: 1 }))
  assert.falsy(equal(object, { 'deep.key3': 2, key1: 1 }))
})

test('equal: recurses through object searches', assert => {
  assert.truthy(equal(object, { deep: { key3: 3 } }))
  assert.falsy(equal(object, { deep: { key3: 4 } }))
})

test('equal: handles mixed object and dot-notation', assert => {
  assert.truthy(equal(object, { 'deep.key3': 3, deep: { key3: 3 } }))
  assert.falsy(equal(object, { 'deep.key3': 4, deep: { key3: 3 } }))
  assert.falsy(equal(object, { 'deep.key3': 3, deep: { key3: 4 } }))
})

test('equal: handles the kitchen sink', assert => {
  assert.truthy(equal(object, {
    key1: 1,
    key2: '2',
    keyNull: null,
    deep: { key3: 3 },
    'deep.key3': 3,
    veryDeep: {
      'value.key4': 4,
      value: { key4: 4 }
    },
    'veryDeep.value.key4': 4
  }))
})

test('equal: uses regexes', assert => {
  assert.truthy(equal(object, { key2: /2/ }))
  assert.falsy(equal(object, { key2: /3/ }))
})

test('equal: handles arrays as values', assert => {
  assert.truthy(equal(object, { many: 1 }))
  assert.truthy(equal(object, { many: '2' }))
  assert.falsy(equal(object, { many: 3 }))
})

test('equal: handles arrays as criterias', assert => {
  assert.truthy(equal(object, { many: [1, '2'] }))
  assert.falsy(equal(object, { many: ['1', 2] }))
})

test('equal: compares strings', assert => {
  assert.truthy(equal(email, { from: 'tester@example.com' }))
  assert.falsy(equal(email, { from: 'other@example.com' }))
})

test('equal: checks if a string is inside of an array', assert => {
  assert.truthy(equal(email, { to: 'myfriend@example.com' }))
  assert.truthy(equal(email, { to: 'boss@example.com' }))
  assert.falsy(equal(email, { to: 'other@example.com' }))
})

test('equal: checks arrays', assert => {
  assert.truthy(equal(email, { to: ['myfriend@example.com', 'boss@example.com'] }))
  assert.falsy(equal(email, { to: ['myfriend@example.com', 'you@example.com'] }))
})
