import { describe, expect, it } from "vitest";

import { Compilation } from "../src/binding/compilation.js";
import { BoundDeclaration, BoundLiteralExpression } from "../src/binding/bound-node.js";
import { PropertySymbol, StructTypeSymbol, VariableSymbol } from "../src/binding/symbol.js";
import { parseSuccessfully } from "./parser-test-helpers.js";

describe("Compilation", () => {
  it("binds one syntax tree and returns ordered top-level declarations", () => {
    const syntaxTree = parseSuccessfully("first:i32=1; second:i32=2;");
    const compilation = new Compilation([syntaxTree]);

    const declarations = compilation.bindAll();

    expect(declarations).toHaveLength(2);
    expect(declarations[0]?.symbol.name).toBe("first");
    expect(declarations[1]?.symbol.name).toBe("second");
  });

  it("binds multiple syntax trees into one shared global module and context", () => {
    const left = parseSuccessfully("first:i32=1;");
    const right = parseSuccessfully("second:i32=2;");
    const compilation = new Compilation([left, right]);

    const declarations = compilation.bindAll();

    expect(declarations).toHaveLength(2);
    expect(compilation.globalModule.get("first")).toBe(declarations[0]?.symbol);
    expect(compilation.globalModule.get("second")).toBe(declarations[1]?.symbol);
    const first = declarations[0];
    const second = declarations[1];
    if (!first || !second) return;
    expect(compilation.context.declarations.get(first.symbol)).toBe(first);
    expect(compilation.context.declarations.get(second.symbol)).toBe(second);
  });

  it("records nested struct properties only in the binding context", () => {
    const syntaxTree = parseSuccessfully("Point:=struct { x:i32=10; };");
    const compilation = new Compilation([syntaxTree]);

    const declarations = compilation.bindAll();

    expect(declarations).toHaveLength(1);
    const point = declarations[0]?.symbol;
    expect(point).toBeInstanceOf(StructTypeSymbol);
    if (!(point instanceof StructTypeSymbol)) return;

    const x = point.get("x");
    expect(x).toBeInstanceOf(PropertySymbol);
    if (!(x instanceof PropertySymbol)) return;

    expect(declarations.map((declaration) => declaration.symbol)).not.toContain(x);
    const propertyDeclaration = compilation.context.declarations.get(x);
    expect(propertyDeclaration).toBeInstanceOf(BoundDeclaration);
    expect(propertyDeclaration?.initializer).toBeInstanceOf(BoundLiteralExpression);
  });

  it("records top-level declarations in the binding context", () => {
    const syntaxTree = parseSuccessfully("value:i32=1;");
    const compilation = new Compilation([syntaxTree]);

    const declarations = compilation.bindAll();

    const value = compilation.globalModule.get("value");
    expect(value).toBeInstanceOf(VariableSymbol);
    expect(value).toBe(declarations[0]?.symbol);
    if (!value) return;
    expect(compilation.context.declarations.get(value)).toBe(declarations[0]);
  });

  it("exposes diagnostics from the shared binding context", () => {
    const compilation = new Compilation([]);

    expect(compilation.diagnostics).toBe(compilation.context.diagnostics);
  });
});
