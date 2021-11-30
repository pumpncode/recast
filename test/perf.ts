import path from "https://deno.land/std@0.116.0/node/path.ts";
import fs from "https://deno.land/std@0.116.0/node/fs.ts";
import * as recast from "../main.ts";

const source = fs.readFileSync(
  path.join(__dirname, "data", "backbone.js"),
  "utf8",
);

const start = +new Date();
const ast = recast.parse(source);
const types = Object.create(null);

const parseTime = +new Date() - start;
console.log("parse", parseTime, "ms");

recast.visit(ast, {
  visitNode: function (path) {
    types[path.value.type] = true;
    this.traverse(path);
  },
});

const visitTime = +new Date() - start - parseTime;
console.log("visit", visitTime, "ms");

recast.prettyPrint(ast).code;

const printTime = +new Date() - start - visitTime - parseTime;
console.log("print", printTime, "ms");

console.log("total", +new Date() - start, "ms");
