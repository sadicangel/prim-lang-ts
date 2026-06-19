import { describe, expect, it } from "vitest";

import { SyntaxKind } from "../src/syntax-kind.js";
import {
  AssignmentExpression,
  BinaryExpressionSyntax,
  BlockExpressionSyntax,
  CallExpressionSyntax,
  ConversionExpressionSyntax,
  ElementAccessExpressionSyntax,
  GroupExpressionSyntax,
  LambdaExpressionSyntax,
  MemberAccessExpressionSyntax,
  StructInitializerExpressionSyntax,
  UnaryExpressionSyntax
} from "../src/syntax/expression-syntax.js";
import { childrenOf, parseExpression } from "./parser-test-helpers.js";

describe("Parser expressions", () => {
  it.each([
    ["42i8", SyntaxKind.I8LiteralExpression],
    ["42u8", SyntaxKind.U8LiteralExpression],
    ["42i16", SyntaxKind.I16LiteralExpression],
    ["42u16", SyntaxKind.U16LiteralExpression],
    ["42i32", SyntaxKind.I32LiteralExpression],
    ["42u32", SyntaxKind.U32LiteralExpression],
    ["42i64", SyntaxKind.I64LiteralExpression],
    ["42u64", SyntaxKind.U64LiteralExpression],
    ["4.2f16", SyntaxKind.F16LiteralExpression],
    ["4.2f32", SyntaxKind.F32LiteralExpression],
    ["4.2f64", SyntaxKind.F64LiteralExpression],
    ['"hello"', SyntaxKind.StrLiteralExpression],
    ["true", SyntaxKind.TrueLiteralExpression],
    ["false", SyntaxKind.FalseLiteralExpression],
    ["null", SyntaxKind.NullLiteralExpression]
  ] as const)("parses literal %s", (text, syntaxKind) => {
    expect(parseExpression(text).syntaxKind).toBe(syntaxKind);
  });

  it.each([
    ["+", SyntaxKind.UnaryPlusExpression],
    ["-", SyntaxKind.UnaryMinusExpression],
    ["~", SyntaxKind.OnesComplementExpression],
    ["!", SyntaxKind.NotExpression]
  ] as const)("parses unary operator %s", (operator, syntaxKind) => {
    const expression = parseExpression(`${operator}value`);

    expect(expression).toBeInstanceOf(UnaryExpressionSyntax);
    expect(expression.syntaxKind).toBe(syntaxKind);
  });

  it.each([
    ["+", SyntaxKind.AddExpression],
    ["-", SyntaxKind.SubtractExpression],
    ["*", SyntaxKind.MultiplyExpression],
    ["/", SyntaxKind.DivideExpression],
    ["%", SyntaxKind.ModuloExpression],
    ["**", SyntaxKind.PowerExpression],
    ["<<", SyntaxKind.LeftShiftExpression],
    [">>", SyntaxKind.RightShiftExpression],
    ["||", SyntaxKind.LogicalOrExpression],
    ["&&", SyntaxKind.LogicalAndExpression],
    ["|", SyntaxKind.BitwiseOrExpression],
    ["&", SyntaxKind.BitwiseAndExpression],
    ["^", SyntaxKind.ExclusiveOrExpression],
    ["==", SyntaxKind.EqualsExpression],
    ["!=", SyntaxKind.NotEqualsExpression],
    ["<", SyntaxKind.LessThanExpression],
    ["<=", SyntaxKind.LessThanOrEqualExpression],
    [">", SyntaxKind.GreaterThanExpression],
    [">=", SyntaxKind.GreaterThanOrEqualExpression],
    ["??", SyntaxKind.CoalesceExpression]
  ] as const)("parses binary operator %s", (operator, syntaxKind) => {
    const expression = parseExpression(`a ${operator} b`);

    expect(expression).toBeInstanceOf(BinaryExpressionSyntax);
    expect(expression.syntaxKind).toBe(syntaxKind);
  });

  it("respects binary precedence and left associativity", () => {
    const precedence = parseExpression("a + b * c") as BinaryExpressionSyntax;
    const associativity = parseExpression("a - b - c") as BinaryExpressionSyntax;

    expect(precedence.syntaxKind).toBe(SyntaxKind.AddExpression);
    expect(precedence.right.syntaxKind).toBe(SyntaxKind.MultiplyExpression);
    expect(associativity.syntaxKind).toBe(SyntaxKind.SubtractExpression);
    expect(associativity.left.syntaxKind).toBe(SyntaxKind.SubtractExpression);
  });

  it("parses primary expression forms", () => {
    expect(parseExpression("module").syntaxKind).toBe(SyntaxKind.ModuleExpression);
    expect(parseExpression("name").syntaxKind).toBe(SyntaxKind.NameExpression);
    expect(parseExpression("i32").syntaxKind).toBe(SyntaxKind.NameExpression);
    expect(parseExpression("(name)")).toBeInstanceOf(GroupExpressionSyntax);
    expect(parseExpression("[1, 2]").syntaxKind).toBe(SyntaxKind.ArrayInitializerExpression);
    expect(parseExpression("struct { field:i32=1; }").syntaxKind).toBe(
      SyntaxKind.StructExpression
    );
  });

  it("parses blocks containing declarations, statements, and final expressions", () => {
    const expression = parseExpression("{ local:i32=1; local; local }");

    expect(expression).toBeInstanceOf(BlockExpressionSyntax);
    const block = expression as BlockExpressionSyntax;
    expect(block.items.syntaxNodes.map((item) => item.syntaxKind)).toEqual([
      SyntaxKind.LocalDeclaration,
      SyntaxKind.ExpressionStatement,
      SyntaxKind.NameExpression
    ]);
  });

  it("parses lambdas and their separated parameters", () => {
    const expression = parseExpression("(left, right) => left + right");

    expect(expression).toBeInstanceOf(LambdaExpressionSyntax);
    const lambda = expression as LambdaExpressionSyntax;
    expect(lambda.parameters).toHaveLength(2);
    expect(lambda.parameters.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
    expect(lambda.body.syntaxKind).toBe(SyntaxKind.AddExpression);
  });

  it("parses assignment", () => {
    const expression = parseExpression("target = value");

    expect(expression).toBeInstanceOf(AssignmentExpression);
    expect(expression.syntaxKind).toBe(SyntaxKind.AssignmentExpression);
  });

  it("parses calls and argument separators", () => {
    const expression = parseExpression("make(1, 2)");

    expect(expression).toBeInstanceOf(CallExpressionSyntax);
    const call = expression as CallExpressionSyntax;
    expect(call.argumentList).toHaveLength(2);
    expect(call.argumentList.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
  });

  it("parses chained postfix expressions", () => {
    const expression = parseExpression("service.make(1)[0].value as i64");

    expect(expression).toBeInstanceOf(ConversionExpressionSyntax);
    const conversion = expression as ConversionExpressionSyntax;
    expect(conversion.type.syntaxKind).toBe(SyntaxKind.I64Type);
    expect(conversion.expression).toBeInstanceOf(MemberAccessExpressionSyntax);
    const member = conversion.expression as MemberAccessExpressionSyntax;
    expect(member.receiver).toBeInstanceOf(ElementAccessExpressionSyntax);
    const element = member.receiver as ElementAccessExpressionSyntax;
    expect(element.receiver).toBeInstanceOf(CallExpressionSyntax);
  });

  it("parses struct initializers and their properties", () => {
    const expression = parseExpression("Point { x=1, y=2 }");

    expect(expression).toBeInstanceOf(StructInitializerExpressionSyntax);
    const initializer = expression as StructInitializerExpressionSyntax;
    expect(initializer.properties).toHaveLength(2);
    expect(initializer.properties.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
  });

  it("enumerates group-expression children in source order", () => {
    const group = parseExpression("(value)") as GroupExpressionSyntax;

    expect(childrenOf(group).map((child) => child.syntaxKind)).toEqual([
      SyntaxKind.ParenthesisOpenToken,
      SyntaxKind.NameExpression,
      SyntaxKind.ParenthesisCloseToken
    ]);
  });
});
