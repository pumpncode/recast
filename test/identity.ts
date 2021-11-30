import assert from "https://deno.land/std@0.116.0/node/assert.ts";
import fs from "https://deno.land/std@0.116.0/node/fs.ts";
import path from "https://deno.land/std@0.116.0/node/path.ts";
import * as types from "https://esm.sh/ast-types";
import * as recast from "../main.ts";

const nodeMajorVersion = parseInt(process.versions.node, 10);

function testFile(path: string, options: { parser?: any } = {}) {
  fs.readFile(path, "utf-8", function (err, source) {
    assert.equal(err, null);
    assert.strictEqual(typeof source, "string");

    const ast = recast.parse(source, options);
    types.astNodesAreEquivalent.assert(ast.original, ast);
    const code = recast.print(ast).code;
    assert.strictEqual(source, code);
  });
}

function addTest(name: string) {
  it(name, function () {
    const filename = path.join(__dirname, "..", name);

    if (path.extname(filename) === ".ts") {
      // Babel 7 no longer supports Node 4 and 5.
      if (nodeMajorVersion >= 6) {
        testFile(filename, { parser: require("../parsers/typescript") });
      }
    } else {
      testFile(filename);
    }
  });
}

describe("identity", function () {
  // Add more tests here as need be.
  addTest("test/data/regexp-props.js");
  addTest("test/data/empty.js");
  addTest("test/data/backbone.js");
  addTest("test/lines.ts");
  addTest("lib/lines.ts");
  addTest("lib/printer.ts");
});
