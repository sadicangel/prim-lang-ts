import { describe, expect, it } from "vitest";

import { PredefinedTypeNames } from "../src/predefined-type-names.js";
import { ModuleBinder } from "../src/binding/binder.js";
import {
  BoundDeclaration,
  BoundLambdaExpression,
  BoundLiteralExpression,
  BoundModuleExpression,
  BoundNeverExpression,
  BoundObjectInitializerExpression,
  BoundTypeExpression,
  BoundVariableLocation
} from "../src/binding/bound-node.js";
import { LambdaTypeSymbol, ModuleSymbol, PropertySymbol, StructTypeSymbol, VariableSymbol } from "../src/binding/symbol.js";
import { parseDeclaration, parseExpression } from "./parser-test-helpers.js";

type TestSymbols = {
  readonly global: ModuleSymbol;
  readonly binder: ModuleBinder;
};

function createGlobalModule(): TestSymbols {
  const global = new ModuleSymbol("<global>", undefined as unknown as ModuleSymbol, undefined);
  (global as { containingModule: ModuleSymbol }).containingModule = global;

  for (const name of Object.values(PredefinedTypeNames)) {
    global.add(new StructTypeSymbol(name, global, undefined));
  }

  return { global, binder: new ModuleBinder(global) };
}

function bindExpression(binder: ModuleBinder, text: string) {
  return binder.bind(parseExpression(text));
}

describe("Binder", () => {
  it("binds a variable name as a variable location", () => {
    const { global, binder } = createGlobalModule();
    const variable = new VariableSymbol("value", global.i32Type, global, false, false, undefined);
    global.add(variable);

    const bound = bindExpression(binder, "value");

    expect(bound).toBeInstanceOf(BoundVariableLocation);
    expect((bound as BoundVariableLocation).symbol).toBe(variable);
  });

  it("binds a type name as a type expression", () => {
    const { global, binder } = createGlobalModule();
    const point = new StructTypeSymbol("Point", global, undefined);
    global.add(point);

    const bound = bindExpression(binder, "Point");

    expect(bound).toBeInstanceOf(BoundTypeExpression);
    expect((bound as BoundTypeExpression).symbol).toBe(point);
    expect(bound.type).toBe(global.typeType);
  });

  it("binds a module name as a module expression", () => {
    const { global, binder } = createGlobalModule();
    const math = new ModuleSymbol("math", global, undefined);
    global.add(math);

    const bound = bindExpression(binder, "math");

    expect(bound).toBeInstanceOf(BoundModuleExpression);
    expect((bound as BoundModuleExpression).symbol).toBe(math);
    expect(bound.type).toBe(global.moduleType);
  });

  it("resolves qualified names through module members", () => {
    const { global, binder } = createGlobalModule();
    const math = new ModuleSymbol("math", global, undefined);
    const point = new StructTypeSymbol("Point", math, undefined);
    math.add(point);
    global.add(math);

    const bound = bindExpression(binder, "math.Point");

    expect(bound).toBeInstanceOf(BoundTypeExpression);
    expect((bound as BoundTypeExpression).symbol).toBe(point);
  });

  it("binds object initializers to their struct type and properties", () => {
    const { global, binder } = createGlobalModule();
    const math = new ModuleSymbol("math", global, undefined);
    const point = new StructTypeSymbol("Point", math, undefined);
    const x = new PropertySymbol("x", global.i32Type, point, false, false, undefined);
    const y = new PropertySymbol("y", global.i32Type, point, false, false, undefined);
    point.add(x);
    point.add(y);
    math.add(point);
    global.add(math);

    const bound = bindExpression(binder, "math.Point { x = 10, y = 20 }");

    expect(bound).toBeInstanceOf(BoundObjectInitializerExpression);
    const initializer = bound as BoundObjectInitializerExpression;
    expect(initializer.type).toBe(point);
    expect(initializer.properties).toHaveLength(2);
    expect(initializer.properties[0]?.property).toBe(x);
    expect(initializer.properties[1]?.property).toBe(y);
  });

  it("rejects assignment to a type expression", () => {
    const { global, binder } = createGlobalModule();
    global.add(new StructTypeSymbol("Point", global, undefined));

    const bound = bindExpression(binder, "Point = 1");

    expect(bound).toBeInstanceOf(BoundNeverExpression);
  });

  it("rejects unknown object initializer properties", () => {
    const { global, binder } = createGlobalModule();
    const point = new StructTypeSymbol("Point", global, undefined);
    point.add(new PropertySymbol("x", global.i32Type, point, false, false, undefined));
    global.add(point);

    const bound = bindExpression(binder, "Point { z = 10 }");

    expect(bound).toBeInstanceOf(BoundNeverExpression);
  });

  it("records struct property declarations in the binding context", () => {
    const { global, binder } = createGlobalModule();

    const bound = bindExpression(binder, "struct { x:i32=10; y:i32=20; }");

    expect(bound).toBeInstanceOf(BoundTypeExpression);
    const structType = (bound as BoundTypeExpression).symbol as StructTypeSymbol;
    const members = Array.from(structType.members());
    expect(members).toHaveLength(2);

    const x = structType.get("x");
    expect(x).toBeInstanceOf(PropertySymbol);
    if (!(x instanceof PropertySymbol)) return;
    expect(x.type).toBe(global.i32Type);
    expect("initializer" in x).toBe(false);

    const declaration = binder.context.declarations.get(x);
    expect(declaration).toBeInstanceOf(BoundDeclaration);
    expect(declaration?.symbol).toBe(x);
    expect(declaration?.initializer).toBeInstanceOf(BoundLiteralExpression);
    expect(declaration?.initializer?.type).toBe(global.i32Type);
  });

  it("records function-like lambda declarations under their variable symbol", () => {
    const { binder } = createGlobalModule();
    const syntax = parseDeclaration("add:(i32)->i32=(x)=>x;");

    const bound = binder.bind(syntax);

    expect(bound).toBeInstanceOf(BoundDeclaration);
    const symbol = (bound as BoundDeclaration).symbol;
    expect(symbol).toBeInstanceOf(VariableSymbol);
    if (!(symbol instanceof VariableSymbol)) return;
    expect(symbol.type).toBeInstanceOf(LambdaTypeSymbol);

    const declaration = binder.context.declarations.get(symbol);
    expect(declaration).toBe(bound);
    expect(declaration?.initializer).toBeInstanceOf(BoundLambdaExpression);
  });
});
