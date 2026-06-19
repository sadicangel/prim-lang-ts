import { expect } from "vitest";

import type { Diagnostic } from "../src/diagnostics/diagnostic.js";
import { Lexer } from "../src/syntax/lexer.js";
import { Parser } from "../src/syntax/parser.js";
import { SyntaxTokenStream } from "../src/syntax/syntax-token-stream.js";
import type { CompilationUnitSyntax } from "../src/syntax/compilation-unit-syntax.js";
import type { GlobalDeclarationSyntax } from "../src/syntax/declaration-syntax.js";
import type { ExpressionSyntax } from "../src/syntax/expression-syntax.js";
import type { SyntaxNode } from "../src/syntax-node.js";
import type { TypeSyntax } from "../src/syntax/type-syntax.js";
import { SourceText } from "../src/text/source-text.js";

export type ParseResult = {
  readonly compilationUnit: CompilationUnitSyntax;
  readonly lexerDiagnostics: readonly Diagnostic[];
  readonly parser: Parser;
};

export function parse(text: string): ParseResult {
  const lexer = new Lexer(new SourceText(text));
  const parser = new Parser(new SyntaxTokenStream(lexer.scanAll()));
  const compilationUnit = parser.parse();
  return { compilationUnit, lexerDiagnostics: lexer.diagnostics, parser };
}

export function parseSuccessfully(text: string): CompilationUnitSyntax {
  const result = parse(text);
  expect(result.lexerDiagnostics).toEqual([]);
  expect(result.parser.diagnostics).toEqual([]);
  return result.compilationUnit;
}

export function parseDeclaration(text: string): GlobalDeclarationSyntax {
  const compilationUnit = parseSuccessfully(text);
  expect(compilationUnit.declarations).toHaveLength(1);
  const declaration = compilationUnit.declarations[0];
  if (declaration === undefined) throw new Error("Expected one declaration.");
  return declaration;
}

export function parseType(text: string): TypeSyntax {
  const type = parseDeclaration(`value:${text} = 0;`).type;
  if (type === undefined) throw new Error("Expected declaration type.");
  return type;
}

export function parseExpression(text: string): ExpressionSyntax {
  return parseDeclaration(`value:i32=${text};`).initializer;
}

export function childrenOf(node: { children(): Iterator<SyntaxNode> }): readonly SyntaxNode[] {
  const children = new Array<SyntaxNode>();
  const iterator = node.children();
  while (true) {
    const next = iterator.next();
    if (next.done) return children;
    children.push(next.value);
  }
}
