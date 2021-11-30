"use strict";

import { parse } from "../lib/parser.ts";
import { Printer } from "../lib/printer.ts";
import * as types from "https://esm.sh/ast-types";
const nodeMajorVersion = parseInt(process.versions.node, 10);

for (const { title, parser } of [
  { title: "Babel JSX Compatibility", parser: require("../parsers/babel") },
  { title: "Esprima JSX Compatibility", parser: require("../parsers/esprima") },
]) {
  (nodeMajorVersion >= 6 ? describe : xdescribe)(title, function () {
    const printer = new Printer({ tabWidth: 2 });
    const parseOptions = { parser };

    function check(source: string) {
      const ast1 = parse(source, parseOptions);
      const ast2 = parse(printer.printGenerically(ast1).code, parseOptions);
      types.astNodesAreEquivalent.assert(ast1, ast2);
    }

    it("should parse and print attribute comments", function () {
      check("<b /* comment */ />");
      check("<b /* multi\nline\ncomment */ />");
    });

    it("should parse and print child comments", function () {
      check("<b>{/* comment */}</b>");
      check("<b>{/* multi\nline\ncomment */}</b>");
    });

    it("should parse and print literal attributes", function () {
      check('<b className="hello" />');
    });

    it("should parse and print expression attributes", function () {
      check("<b className={classes} />");
    });

    it("should parse and print chidren", function () {
      check("<label><input /></label>");
    });

    it("should parse and print literal chidren", function () {
      check("<b>hello world</b>");
    });

    it("should parse and print expression children", function () {
      check("<b>{this.props.user.name}</b>");
    });

    it("should parse and print namespaced elements", function () {
      check("<Foo.Bar />");
    });

    // Esprima does not parse JSX fragments: https://github.com/jquery/esprima/issues/2020
    (/esprima/i.test(title)
      ? xit
      : it)("should parse and print fragments", function () {
      check(["<>", "  <td>Hello</td>", "  <td>world!</td>", "</>"].join("\n"));
    });
  });
}
