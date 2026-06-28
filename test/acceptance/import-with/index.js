const test = require("node:test");
const assert = require("node:assert");
const { generate, first, parse } = require("../../..");

test("import-with: can be parsed", () => {
  const source = `import Env from 'env.json' with { type: 'json' }`;
  const tree = parse(source);
  const node = first(tree, "ImportDeclaration");
  assert(node);
  assert.equal(node.source.value, "env.json");
});

test("import-with: can be generated", () => {
  const source = `import Env from 'env.json' with { type: 'json' }`;
  const tree = parse(source);
  const output = generate(tree);
  assert(output.includes('import Env from "env.json"'));
  assert(output.includes("with"));
  assert(output.includes("type"));
  assert(output.includes("json"));
});
