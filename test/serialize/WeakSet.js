const test = require("node:test");
const assert = require("node:assert");
const { serialize } = require("../..");

test("serialize: WeakSet", () => {
  assert.ok(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakSet",
      },
      arguments: [],
    }) instanceof WeakSet,
  );

  assert.ok(
    serialize({
      type: "NewExpression",
      callee: {
        type: "Identifier",
        name: "WeakSet",
      },
      arguments: [{ type: "ObjectExpression", properties: [] }],
    }) instanceof WeakSet,
  );
});
