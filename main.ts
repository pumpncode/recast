import fs from "https://deno.land/std@0.116.0/node/fs.ts";
import * as types from "https://esm.sh/ast-types";
import { parse } from "./lib/parser.ts";
import { Printer } from "./lib/printer.ts";
// import { Options } from "./lib/options.ts";

export {
  /**
   * Parse a string of code into an augmented syntax tree suitable for
   * arbitrary modification and reprinting.
   */
  parse,

  /**
   * Convenient shorthand for the ast-types package.
   */
  types,
};

/**
 * Traverse and potentially modify an abstract syntax tree using a
 * convenient visitor syntax:
 *
 *   recast.visit(ast, {
 *     names: [],
 *     visitIdentifier: function(path) {
 *       var node = path.value;
 *       this.visitor.names.push(node.name);
 *       this.traverse(path);
 *     }
 *   });
 */
export { visit } from "https://esm.sh/ast-types";

/**
 * Options shared between parsing and printing.
 */
// export { Options } from "./lib/options.ts";

/**
 * Reprint a modified syntax tree using as much of the original source
 * code as possible.
 */
export function print(node: types.ASTNode, options?: Options) {
  return new Printer(options).print(node);
}

/**
 * Print without attempting to reuse any original source code.
 */
export function prettyPrint(node: types.ASTNode, options?: Options) {
  return new Printer(options).printGenerically(node);
}

/**
 * Convenient command-line interface (see e.g. example/add-braces).
 */
export function run(transformer: Transformer, options?: RunOptions) {
  return runFile(process.argv[2], transformer, options);
}

export interface Transformer {
  (ast: types.ASTNode, callback: (ast: types.ASTNode) => void): void;
}

export interface RunOptions extends Options {
  writeback?(code: string): void;
}

function runFile(path: any, transformer: Transformer, options?: RunOptions) {
  fs.readFile(path, "utf-8", function(err, code) {
    if (err) {
      console.error(err);
      return;
    }

    runString(code, transformer, options);
  });
}

function defaultWriteback(output: string) {
  process.stdout.write(output);
}

function runString(code: string, transformer: Transformer, options?: RunOptions) {
  const writeback = options && options.writeback || defaultWriteback;
  transformer(parse(code, options), function(node: any) {
    writeback(print(node, options).code);
  });
}
