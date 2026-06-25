import { describe, expect, it } from "vitest";

import { SyntaxKind } from "../src/syntax-kind.js";
import {
  AssignmentExpression,
  BinaryExpressionSyntax,
  BlockExpressionSyntax,
  InvocationExpressionSyntax,
  BreakExpressionSyntax,
  ContinueExpressionSyntax,
  ConversionExpressionSyntax,
  ElementAccessExpressionSyntax,
  GroupExpressionSyntax,
  IfElseExpressionSyntax,
  LambdaExpressionSyntax,
  MemberAccessExpressionSyntax,
  ReturnExpressionSyntax,
  ObjectInitializerExpressionSyntax,
  UnaryExpressionSyntax,
  WhileExpressionSyntax
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

    expect(expression).toBeInstanceOf(InvocationExpressionSyntax);
    const call = expression as InvocationExpressionSyntax;
    expect(call.arguments_).toHaveLength(2);
    expect(call.arguments_.separatorAt(0).syntaxKind).toBe(SyntaxKind.CommaToken);
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
    expect(element.receiver).toBeInstanceOf(InvocationExpressionSyntax);
  });

  it("parses struct initializers and their properties", () => {
    const expression = parseExpression("Point { x=1, y=2 }");

    expect(expression).toBeInstanceOf(ObjectInitializerExpressionSyntax);
    const initializer = expression as ObjectInitializerExpressionSyntax;
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

  it("parses if expressions with and without else", () => {
    const withElse = parseExpression("if (ready) yes else no");
    const withoutElse = parseExpression("if (ready) yes");

    expect(withElse).toBeInstanceOf(IfElseExpressionSyntax);
    expect((withElse as IfElseExpressionSyntax).elseClause?.expression.syntaxKind).toBe(
      SyntaxKind.NameExpression
    );
    expect(withoutElse).toBeInstanceOf(IfElseExpressionSyntax);
    expect((withoutElse as IfElseExpressionSyntax).elseClause).toBeUndefined();
  });

  it("associates else with the nearest if expression", () => {
    const expression = parseExpression("if (outer) if (inner) one else two else three");

    expect(expression).toBeInstanceOf(IfElseExpressionSyntax);
    const outer = expression as IfElseExpressionSyntax;
    expect(outer.then).toBeInstanceOf(IfElseExpressionSyntax);
    expect((outer.then as IfElseExpressionSyntax).elseClause).toBeDefined();
    expect(outer.elseClause).toBeDefined();
  });

  it("parses while expressions with arbitrary expression bodies", () => {
    const simple = parseExpression("while (ready) work()");
    const block = parseExpression("while (ready) { work(); continue; }");

    expect(simple).toBeInstanceOf(WhileExpressionSyntax);
    expect((simple as WhileExpressionSyntax).body).toBeInstanceOf(InvocationExpressionSyntax);
    expect(block).toBeInstanceOf(WhileExpressionSyntax);
    expect((block as WhileExpressionSyntax).body).toBeInstanceOf(BlockExpressionSyntax);
  });

  it("parses value and unit break expressions", () => {
    const withValue = parseExpression("while (true) { break 42; }") as WhileExpressionSyntax;
    const withoutValue = parseExpression("while (true) { break; }") as WhileExpressionSyntax;

    const valueBlock = withValue.body as BlockExpressionSyntax;
    const unitBlock = withoutValue.body as BlockExpressionSyntax;
    const valueBreak = (valueBlock.items[0] as { expression: BreakExpressionSyntax }).expression;
    const unitBreak = (unitBlock.items[0] as { expression: BreakExpressionSyntax }).expression;
    expect(valueBreak).toBeInstanceOf(BreakExpressionSyntax);
    expect(valueBreak.expression?.syntaxKind).toBe(SyntaxKind.I32LiteralExpression);
    expect(unitBreak).toBeInstanceOf(BreakExpressionSyntax);
    expect(unitBreak.expression).toBeUndefined();
  });

  it("parses continue and return expressions", () => {
    const expression = parseExpression("{ continue; return 42; return }") as BlockExpressionSyntax;

    expect((expression.items[0] as { expression: ContinueExpressionSyntax }).expression)
      .toBeInstanceOf(ContinueExpressionSyntax);
    const valueReturn = (expression.items[1] as { expression: ReturnExpressionSyntax }).expression;
    expect(valueReturn).toBeInstanceOf(ReturnExpressionSyntax);
    expect(valueReturn.expression?.syntaxKind).toBe(SyntaxKind.I32LiteralExpression);
    expect(expression.items[2]).toBeInstanceOf(ReturnExpressionSyntax);
    expect((expression.items[2] as ReturnExpressionSyntax).expression).toBeUndefined();
  });

  it("allows control-flow expressions as direct lambda bodies", () => {
    const returnLambda = parseExpression("() => return 42");
    const ifLambda = parseExpression("(x) => if (x) 1 else 0");

    expect((returnLambda as LambdaExpressionSyntax).body).toBeInstanceOf(
      ReturnExpressionSyntax
    );
    expect((ifLambda as LambdaExpressionSyntax).body).toBeInstanceOf(IfElseExpressionSyntax);
  });
});
