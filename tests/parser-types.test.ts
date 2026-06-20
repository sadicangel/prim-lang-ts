import { describe, expect, it } from "vitest";

import { SyntaxKind } from "../src/syntax-kind.js";
import {
  ArrayTypeSyntax,
  LambdaTypeSyntax,
  MaybeTypeSyntax,
  NamedTypeSyntax,
  PointerTypeSyntax,
  PredefinedTypeSyntax,
  UnionTypeSyntax
} from "../src/syntax/type-syntax.js";
import {
  childrenOf,
  parseDeclaration,
  parseSuccessfully,
  parseType
} from "./parser-test-helpers.js";

describe("Parser declarations and types", () => {
  it("parses a compilation unit with qualified and simple declarations", () => {
    const unit = parseSuccessfully("root.value:i32=1; other:str=\"ok\";");

    expect(unit.declarations).toHaveLength(2);
    expect(unit.declarations[0]?.name.syntaxKind).toBe(SyntaxKind.QualifiedName);
    expect(unit.declarations[1]?.name.syntaxKind).toBe(SyntaxKind.SimpleName);
    expect(unit.eofToken.syntaxKind).toBe(SyntaxKind.EofToken);
  });

  it("parses a local declaration inside a block", () => {
    const declaration = parseDeclaration("main:i32={ local:i32=1; local };");
    const block = declaration.initializer;

    expect(block.syntaxKind).toBe(SyntaxKind.BlockExpression);
    if (block.syntaxKind !== SyntaxKind.BlockExpression) return;
    expect(block.items).toHaveLength(2);
    expect(block.items[0]?.syntaxKind).toBe(SyntaxKind.LocalDeclaration);
    expect(block.items[1]?.syntaxKind).toBe(SyntaxKind.NameExpression);
  });

  it.each([
    {
      text: "value:i32:42;",
      typeKind: SyntaxKind.I32Type,
      operatorKind: SyntaxKind.ColonToken
    },
    {
      text: "value:i32=42;",
      typeKind: SyntaxKind.I32Type,
      operatorKind: SyntaxKind.EqualsToken
    },
    {
      text: "value::42;",
      typeKind: undefined,
      operatorKind: SyntaxKind.ColonToken
    },
    {
      text: "value:=42;",
      typeKind: undefined,
      operatorKind: SyntaxKind.EqualsToken
    }
  ] as const)("parses declaration $text", ({ text, typeKind, operatorKind }) => {
    const declaration = parseDeclaration(text);

    expect(declaration.type?.syntaxKind).toBe(typeKind);
    expect(declaration.operatorToken.syntaxKind).toBe(operatorKind);
    expect(declaration.initializer.syntaxKind).toBe(SyntaxKind.I32LiteralExpression);
  });

  it.each([
    ["any", SyntaxKind.AnyType],
    ["err", SyntaxKind.ErrType],
    ["unknown", SyntaxKind.UnknownType],
    ["never", SyntaxKind.NeverType],
    ["unit", SyntaxKind.UnitType],
    ["type", SyntaxKind.TypeType],
    ["str", SyntaxKind.StrType],
    ["bool", SyntaxKind.BoolType],
    ["i8", SyntaxKind.I8Type],
    ["i16", SyntaxKind.I16Type],
    ["i32", SyntaxKind.I32Type],
    ["i64", SyntaxKind.I64Type],
    ["isz", SyntaxKind.IszType],
    ["u8", SyntaxKind.U8Type],
    ["u16", SyntaxKind.U16Type],
    ["u32", SyntaxKind.U32Type],
    ["u64", SyntaxKind.U64Type],
    ["usz", SyntaxKind.UszType],
    ["f16", SyntaxKind.F16Type],
    ["f32", SyntaxKind.F32Type],
    ["f64", SyntaxKind.F64Type]
  ] as const)("parses predefined type %s", (text, syntaxKind) => {
    const type = parseType(text);

    expect(type).toBeInstanceOf(PredefinedTypeSyntax);
    expect(type.syntaxKind).toBe(syntaxKind);
  });

  it("parses a named type", () => {
    const type = parseType("Widget");

    expect(type).toBeInstanceOf(NamedTypeSyntax);
    expect(type.syntaxKind).toBe(SyntaxKind.NamedType);
  });

  it("parses a qualified named type", () => {
    const type = parseType("collections.Vector");

    expect(type).toBeInstanceOf(NamedTypeSyntax);
    expect((type as NamedTypeSyntax).name.syntaxKind).toBe(SyntaxKind.QualifiedName);
  });

  it("parses unsized and sized array types", () => {
    const unsized = parseType("i32[]");
    const sized = parseType("i32[2 + 3]");

    expect(unsized).toBeInstanceOf(ArrayTypeSyntax);
    expect((unsized as ArrayTypeSyntax).length).toBeUndefined();
    expect(sized).toBeInstanceOf(ArrayTypeSyntax);
    expect((sized as ArrayTypeSyntax).length?.syntaxKind).toBe(SyntaxKind.AddExpression);
  });

  it("parses pointer, maybe, repeated maybe, and chained postfix types", () => {
    const pointer = parseType("i32*");
    const maybe = parseType("i32?");
    const repeatedMaybe = parseType("i32? ?");
    const chained = parseType("i32[4]*?");

    expect(pointer).toBeInstanceOf(PointerTypeSyntax);
    expect(maybe).toBeInstanceOf(MaybeTypeSyntax);
    expect(repeatedMaybe).toBeInstanceOf(MaybeTypeSyntax);
    expect((repeatedMaybe as MaybeTypeSyntax).underlyingType).toBeInstanceOf(MaybeTypeSyntax);
    expect(chained).toBeInstanceOf(MaybeTypeSyntax);
    expect((chained as MaybeTypeSyntax).underlyingType).toBeInstanceOf(PointerTypeSyntax);
  });

  it("parses lambda types and their separated parameters", () => {
    const type = parseType("(i32, str)->bool");

    expect(type).toBeInstanceOf(LambdaTypeSyntax);
    const lambda = type as LambdaTypeSyntax;
    expect(lambda.parameters).toHaveLength(2);
    expect(lambda.parameters.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
    expect(lambda.returnType.syntaxKind).toBe(SyntaxKind.BoolType);
  });

  it("constructs one flat union type", () => {
    const type = parseType("i32 | str | bool");

    expect(type).toBeInstanceOf(UnionTypeSyntax);
    const union = type as UnionTypeSyntax;
    expect(union.types).toHaveLength(3);
    expect(union.types.syntaxNodes.map((node) => node.syntaxKind)).toEqual([
      SyntaxKind.I32Type,
      SyntaxKind.BarToken,
      SyntaxKind.StrType,
      SyntaxKind.BarToken,
      SyntaxKind.BoolType
    ]);
  });

  it("binds postfix types more tightly than unions", () => {
    const type = parseType("i32[] | str*");

    expect(type).toBeInstanceOf(UnionTypeSyntax);
    const union = type as UnionTypeSyntax;
    expect(union.types[0]).toBeInstanceOf(ArrayTypeSyntax);
    expect(union.types[1]).toBeInstanceOf(PointerTypeSyntax);
  });

  it("allows unions in lambda parameters and return types", () => {
    const type = parseType("(i32 | str, bool)->f64 | str");

    expect(type).toBeInstanceOf(LambdaTypeSyntax);
    const lambda = type as LambdaTypeSyntax;
    expect(lambda.parameters[0]).toBeInstanceOf(UnionTypeSyntax);
    expect(lambda.parameters[1]?.syntaxKind).toBe(SyntaxKind.BoolType);
    expect(lambda.returnType).toBeInstanceOf(UnionTypeSyntax);
  });

  it("parses empty and trailing-comma lambda parameter lists", () => {
    const empty = parseType("()->unit") as LambdaTypeSyntax;
    const trailingComma = parseType("(i32,)->unit") as LambdaTypeSyntax;

    expect(empty.parameters).toHaveLength(0);
    expect(trailingComma.parameters).toHaveLength(1);
    expect(trailingComma.parameters.syntaxNodes.map((node) => node.syntaxKind)).toEqual([
      SyntaxKind.I32Type,
      SyntaxKind.CommaToken
    ]);
  });

  it("enumerates array type children in source order", () => {
    const type = parseType("i32[4]") as ArrayTypeSyntax;

    expect(childrenOf(type).map((child) => child.syntaxKind)).toEqual([
      SyntaxKind.I32Type,
      SyntaxKind.BracketOpenToken,
      SyntaxKind.I32LiteralExpression,
      SyntaxKind.BracketCloseToken
    ]);
  });
});
