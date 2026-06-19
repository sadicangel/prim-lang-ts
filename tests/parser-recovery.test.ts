import { describe, expect, it } from "vitest";

import { DiagnosticCode } from "../src/diagnostics/diagnostic-code.js";
import { Lexer } from "../src/syntax/lexer.js";
import { Parser } from "../src/syntax/parser.js";
import { SyntaxTokenStream } from "../src/syntax/syntax-token-stream.js";
import { SourceText } from "../src/text/source-text.js";
import { SyntaxKind } from "../src/syntax-kind.js";
import {
  ErrorTypeSyntax,
  LambdaTypeSyntax,
  UnionTypeSyntax
} from "../src/syntax/type-syntax.js";
import { parse, parseDeclaration } from "./parser-test-helpers.js";

describe("Parser recovery", () => {
  it("reports an unexpected token and inserts an explicitly synthetic token", () => {
    const result = parse("value:i32=1");
    const declaration = result.compilationUnit.declarations[0];

    expect(result.parser.diagnostics).toHaveLength(1);
    expect(result.parser.diagnostics[0]?.code).toBe(DiagnosticCode.UnexpectedToken);
    expect(declaration?.semicolonToken.isSynthetic).toBe(true);
  });

  it("does not classify ordinary one-character tokens as synthetic", () => {
    const declaration = parseDeclaration("x:i32=1;");

    expect(declaration.colonToken.isSynthetic).toBe(false);
    expect(declaration.operatorToken.isSynthetic).toBe(false);
    expect(declaration.semicolonToken.isSynthetic).toBe(false);
  });

  it("clears diagnostics when the parser is reset", () => {
    const invalidLexer = new Lexer(new SourceText("value:i32=1"));
    const parser = new Parser(new SyntaxTokenStream(invalidLexer.scanAll()));
    parser.parse();
    expect(parser.diagnostics).toHaveLength(1);

    const validLexer = new Lexer(new SourceText("value:i32=1;"));
    parser.reset(new SyntaxTokenStream(validLexer.scanAll()));
    parser.parse();

    expect(parser.diagnostics).toEqual([]);
  });

  it("preserves the declaration operator when the type is missing", () => {
    const result = parse("value:=0;");
    const declaration = result.compilationUnit.declarations[0];

    expect(result.compilationUnit.declarations).toHaveLength(1);
    expect(result.parser.diagnostics).toHaveLength(1);
    expect(declaration?.type).toBeInstanceOf(ErrorTypeSyntax);
    expect(declaration?.operatorToken.syntaxKind).toBe(SyntaxKind.EqualsToken);
    expect(declaration?.operatorToken.isSynthetic).toBe(false);
  });

  it("recovers from a missing leading union member without consuming the bar", () => {
    const result = parse("value:|i32=0;");
    const declaration = result.compilationUnit.declarations[0];

    expect(result.compilationUnit.declarations).toHaveLength(1);
    expect(result.parser.diagnostics).toHaveLength(1);
    expect(declaration?.type).toBeInstanceOf(UnionTypeSyntax);
    const union = declaration?.type as UnionTypeSyntax;
    expect(union.types[0]).toBeInstanceOf(ErrorTypeSyntax);
    expect(union.types.separatorAt(0).syntaxKind).toBe(SyntaxKind.BarToken);
    expect(union.types[1]?.syntaxKind).toBe(SyntaxKind.I32Type);
  });

  it("recovers from a missing trailing union member without consuming the operator", () => {
    const result = parse("value:i32| =0;");
    const declaration = result.compilationUnit.declarations[0];

    expect(result.compilationUnit.declarations).toHaveLength(1);
    expect(result.parser.diagnostics).toHaveLength(1);
    expect(declaration?.type).toBeInstanceOf(UnionTypeSyntax);
    const union = declaration?.type as UnionTypeSyntax;
    expect(union.types[1]).toBeInstanceOf(ErrorTypeSyntax);
    expect(declaration?.operatorToken.syntaxKind).toBe(SyntaxKind.EqualsToken);
  });

  it("recovers missing lambda parameter types and preserves separators", () => {
    const result = parse("value:(,i32)->bool=0;");
    const lambda = result.compilationUnit.declarations[0]?.type as LambdaTypeSyntax;

    expect(result.parser.diagnostics).toHaveLength(1);
    expect(lambda.parameters[0]).toBeInstanceOf(ErrorTypeSyntax);
    expect(lambda.parameters.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
    expect(lambda.parameters[1]?.syntaxKind).toBe(SyntaxKind.I32Type);
  });

  it("recovers a missing lambda return type without consuming the declaration operator", () => {
    const result = parse("value:()->=0;");
    const declaration = result.compilationUnit.declarations[0];
    const lambda = declaration?.type as LambdaTypeSyntax;

    expect(result.parser.diagnostics).toHaveLength(1);
    expect(lambda.returnType).toBeInstanceOf(ErrorTypeSyntax);
    expect(declaration?.operatorToken.syntaxKind).toBe(SyntaxKind.EqualsToken);
  });

  it("creates an empty-span error type at EOF", () => {
    const result = parse("value:i32|");
    const union = result.compilationUnit.declarations[0]?.type as UnionTypeSyntax;
    const errorType = union.types[1] as ErrorTypeSyntax;

    expect(result.compilationUnit.declarations).toHaveLength(1);
    expect(errorType).toBeInstanceOf(ErrorTypeSyntax);
    expect(errorType.errorToken.isSynthetic).toBe(true);
    expect(errorType.errorToken.sourceSpan.range.start).toBe(
      errorType.errorToken.sourceSpan.range.end
    );
  });
});
