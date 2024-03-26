const test = require("node:test")
const assert = require("node:assert")
const { equal } = require("..")

const object = {
  key1: 1,
  key2: "2",
  keyNull: null,
  deep: {
    key3: 3,
  },
  veryDeep: {
    value: {
      key4: 4,
    },
  },
  many: [1, "2"],
}

const email = {
  from: "tester@example.com",
  to: ["myfriend@example.com", "boss@example.com"],
  subject: "My Email",
  body: "Hello,\nI will be on vacation for the rest of the year.\n\nThanks!",
}

test("equal: returns true for two exact nodes", () => {
  assert(equal({ type: "ReturnStatement" }, { type: "ReturnStatement" }))
})

test("equal: checks simple keys", () => {
  assert(equal(object, { key1: 1 }))
  assert(equal(object, { keyNull: null }))
  assert(!equal(object, { key1: 0 }, true))
  assert(!equal(object, { keyNull: 1 }))
})

test("equal: checks dot-notation keys", () => {
  assert(equal(object, { "deep.key3": 3 }))
  assert(!equal(object, { "deep.key3": 4 }))
})

test("equal: checks multiple keys", () => {
  assert(equal(object, { key1: 1, key2: "2" }))
  assert(!equal(object, { key1: 1, key2: "3" }))
})

test("equal: checks arrays", () => {
  assert(equal(object, { many: [1, "2"] }))
  assert(!equal(object, { many: [1, "3"] }))
})

test("equal: checks mixed simple and nested keys", () => {
  assert(equal(object, { "deep.key3": 3, key1: 1 }))
  assert(!equal(object, { "deep.key3": 2, key1: 1 }))
})

test("equal: recurses through object searches", () => {
  assert(equal(object, { deep: { key3: 3 } }))
  assert(!equal(object, { deep: { key3: 4 } }))
})

test("equal: handles mixed object and dot-notation", () => {
  assert(equal(object, { "deep.key3": 3, deep: { key3: 3 } }))
  assert(!equal(object, { "deep.key3": 4, deep: { key3: 3 } }))
  assert(!equal(object, { "deep.key3": 3, deep: { key3: 4 } }))
})

test("equal: handles the kitchen sink", () => {
  assert(
    equal(object, {
      key1: 1,
      key2: "2",
      keyNull: null,
      deep: { key3: 3 },
      "deep.key3": 3,
      veryDeep: {
        "value.key4": 4,
        value: { key4: 4 },
      },
      "veryDeep.value.key4": 4,
    })
  )
})

test("equal: uses regexes", () => {
  assert(equal(object, { key2: /2/ }))
  assert(!equal(object, { key2: /3/ }))
})

test("equal: handles arrays as values", () => {
  assert(equal(object, { many: 1 }))
  assert(equal(object, { many: "2" }))
  assert(!equal(object, { many: 3 }))
})

test("equal: handles arrays as criterias", () => {
  assert(equal(object, { many: [1, "2"] }))
  assert(!equal(object, { many: ["1", 2] }))
})

test("equal: compares strings", () => {
  assert(equal(email, { from: "tester@example.com" }))
  assert(!equal(email, { from: "other@example.com" }))
})

test("equal: checks if a string is inside of an array", () => {
  assert(equal(email, { to: "myfriend@example.com" }))
  assert(equal(email, { to: "boss@example.com" }))
  assert(!equal(email, { to: "other@example.com" }))
})

test("equal: checks arrays", () => {
  assert(equal(email, { to: ["myfriend@example.com", "boss@example.com"] }))
  assert(!equal(email, { to: ["myfriend@example.com", "you@example.com"] }))
})
