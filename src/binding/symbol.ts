import { PredefinedTypeNames } from "../predefined-type-names.js";
import type { SyntaxNode } from "../syntax-node.js";
import { SymbolKind, type BinaryOperatorId, type IndexOperatorId, type UnaryOperatorId } from "./symbol-kind.js";


const makeMethodName = (name: string, parameters: readonly TypeSymbol[]): string => {
    return `${name}<${parameters.map(p => p.type.name).join(", ")}>`;
}

export type Symbol = ModuleSymbol | TypeSymbol | MemberSymbol | VariableSymbol;

const GLOBAL_NAME = "<global>";

type ISymbol = {
    readonly kind: SymbolKind;
    readonly name: string;
    readonly fullName: string;
    readonly type: TypeSymbol;
    readonly containingSymbol: Symbol;
    readonly containingModule: ModuleSymbol;
    readonly isReadOnly: boolean;
    readonly isStatic: boolean;
    readonly syntax: SyntaxNode | undefined;
}

const getFullName = (name: string, containingSymbol: Symbol): string => {
    const parts = [name];
    while (containingSymbol.name !== GLOBAL_NAME) {
        parts.unshift(containingSymbol.name);
        containingSymbol = containingSymbol.containingSymbol;
    }
    return parts.join('.');
}

export class ModuleSymbol implements ISymbol {
    #members = new Map<string, Symbol>();
    #global?: ModuleSymbol;
    readonly kind = SymbolKind.Module;
    get fullName() { return getFullName(this.name, this.containingSymbol); }
    get type() { return this.containingModule.moduleType; }
    get containingSymbol() { return this.containingModule; }
    readonly isReadOnly = true;
    readonly isStatic = true;
    get isGlobal(): boolean { return this.name === GLOBAL_NAME; }
    get global(): ModuleSymbol {
        if (!this.#global) {
            this.#global = this;
            while (!this.#global.isGlobal)
                this.#global = this.containingModule;
        }
        return this.#global;
    }

    constructor(readonly name: string, readonly containingModule: ModuleSymbol, readonly syntax: SyntaxNode | undefined) { }

    add(symbol: Symbol): boolean { return !this.#members.has(symbol.name) && !!this.#members.set(symbol.name, symbol); }
    get(name: string): Symbol | undefined { return this.#members.get(name); }

    *members(): Iterable<Symbol> {
        for (const [, member] of this.#members)
            yield member;
    }

    get moduleType(): TypeSymbol { return this.global.get(PredefinedTypeNames.module) as unknown as TypeSymbol; } // TODO: Maybe this should be a different type?
    get typeType(): TypeSymbol { return this.global.get(PredefinedTypeNames.type) as unknown as TypeSymbol; }
    get anyType(): TypeSymbol { return this.global.get(PredefinedTypeNames.any) as unknown as TypeSymbol; }
    get unknownType(): TypeSymbol { return this.global.get(PredefinedTypeNames.unknown) as unknown as TypeSymbol; }
    get neverType(): TypeSymbol { return this.global.get(PredefinedTypeNames.never) as unknown as TypeSymbol; }
    get unitType(): TypeSymbol { return this.global.get(PredefinedTypeNames.unit) as unknown as TypeSymbol; }
    get strType(): TypeSymbol { return this.global.get(PredefinedTypeNames.str) as unknown as TypeSymbol; }
    get boolType(): TypeSymbol { return this.global.get(PredefinedTypeNames.bool) as unknown as TypeSymbol; }
    get i8Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.i8) as unknown as TypeSymbol; }
    get i16Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.i16) as unknown as TypeSymbol; }
    get i32Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.i32) as unknown as TypeSymbol; }
    get i64Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.i64) as unknown as TypeSymbol; }
    get iszType(): TypeSymbol { return this.global.get(PredefinedTypeNames.isz) as unknown as TypeSymbol; }
    get u8Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.u8) as unknown as TypeSymbol; }
    get u16Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.u16) as unknown as TypeSymbol; }
    get u32Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.u32) as unknown as TypeSymbol; }
    get u64Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.u64) as unknown as TypeSymbol; }
    get uszType(): TypeSymbol { return this.global.get(PredefinedTypeNames.usz) as unknown as TypeSymbol; }
    get f16Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.f16) as unknown as TypeSymbol; }
    get f32Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.f32) as unknown as TypeSymbol; }
    get f64Type(): TypeSymbol { return this.global.get(PredefinedTypeNames.f64) as unknown as TypeSymbol; }
}

export type TypeSymbolKind = SymbolKind.ArrayType | SymbolKind.LambdaType | SymbolKind.PointerType | SymbolKind.StructType | SymbolKind.UnionType;

export abstract class TypeSymbol implements ISymbol {
    #members = new Map<string, Symbol>();
    abstract kind: TypeSymbolKind;
    abstract name: string;
    get fullName() { return getFullName(this.name, this.containingSymbol); }
    abstract containingModule: ModuleSymbol;
    get type() { return this.containingModule.typeType; }
    get containingSymbol() { return this.containingModule; }
    readonly isReadOnly = true;
    readonly isStatic = true;
    abstract syntax: SyntaxNode | undefined;

    get isNever(): boolean { return this.name === PredefinedTypeNames.never; }

    add(symbol: Symbol): boolean { return !this.#members.has(symbol.name) && !!this.#members.set(symbol.name, symbol); }
    get(name: string): Symbol | undefined { return this.#members.get(name); }

    *members(): Iterable<Symbol> {
        for (const [, member] of this.#members)
            yield member;
    }

    equals(other?: TypeSymbol): boolean { return this.name === other?.name; }
}

export class ArrayTypeSymbol extends TypeSymbol {
    readonly kind = SymbolKind.ArrayType;
    readonly name: string;
    constructor(
        readonly elementType: TypeSymbol,
        readonly length: number | undefined,
        readonly containingModule: ModuleSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
        this.name = `${elementType.name}[${length?.toString() ?? ""}]`;
    }
}

export class LambdaTypeSymbol extends TypeSymbol {
    readonly kind = SymbolKind.LambdaType;
    readonly name: string;
    constructor(
        readonly parameterTypes: TypeSymbol[],
        readonly returnType: TypeSymbol,
        readonly containingModule: ModuleSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
        this.name = `(${parameterTypes.map(p => p.name).join(", ")}) -> ${returnType.name}`;
    }
}

export class PointerTypeSymbol extends TypeSymbol {
    readonly kind = SymbolKind.PointerType;
    readonly name: string;
    constructor(
        readonly elementType: TypeSymbol,
        readonly containingModule: ModuleSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
        this.name = `${elementType.name}*`;
    }
}

export class StructTypeSymbol extends TypeSymbol {
    readonly kind = SymbolKind.StructType;
    constructor(
        readonly name: string,
        readonly containingModule: ModuleSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
    }
}

export class UnionTypeSymbol extends TypeSymbol {
    readonly kind = SymbolKind.UnionType;
    readonly name: string;
    constructor(
        readonly variantTypes: readonly TypeSymbol[],
        readonly containingModule: ModuleSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
        this.name = variantTypes.map(p => p.name).join(" | ");
    }
}

export type MemberSymbolKind = SymbolKind.Property | SymbolKind.Indexer | SymbolKind.Operator;
export abstract class MemberSymbol implements ISymbol {
    abstract readonly kind: MemberSymbolKind;
    abstract readonly name: string;
    get fullName() { return getFullName(this.name, this.containingSymbol); }
    abstract readonly type: TypeSymbol;
    abstract readonly containingSymbol: Symbol;
    get containingModule(): ModuleSymbol { return this.containingSymbol.containingModule; }
    abstract readonly isReadOnly: boolean;
    abstract readonly isStatic: boolean;
    abstract readonly syntax: SyntaxNode | undefined;
}

export class PropertySymbol extends MemberSymbol {
    readonly kind = SymbolKind.Property;
    constructor(
        readonly name: string,
        readonly type: TypeSymbol,
        readonly containingSymbol: TypeSymbol,
        readonly isReadOnly: boolean,
        readonly isStatic: boolean,
        readonly syntax: SyntaxNode | undefined) {
        super();
    }
}

export class IndexerSymbol extends MemberSymbol {
    readonly kind = SymbolKind.Indexer;
    constructor(
        readonly name: string,
        readonly type: TypeSymbol,
        readonly parameters: readonly TypeSymbol[],
        readonly containingSymbol: TypeSymbol,
        readonly isReadOnly: boolean,
        readonly isStatic: boolean,
        readonly syntax: SyntaxNode | undefined) {
        super();
    }
}

export const makeOperatorName = (id: UnaryOperatorId | BinaryOperatorId | IndexOperatorId, ...parameters: (readonly [TypeSymbol] | readonly [TypeSymbol, TypeSymbol])): string => {
    return makeMethodName(getOperatorName(id), parameters);
}

const getOperatorName = (id: UnaryOperatorId | BinaryOperatorId | IndexOperatorId): string => {
    switch (id) {
        case "UnaryPlus": return "operator_+";
        case "UnaryMinus": return "operator_-";
        case "OnesComplement": return "operator_~";
        case "Not": return "operator_!";
        case "Add": return "operator_+";
        case "Subtract": return "operator_-";
        case "Multiply": return "operator_*";
        case "Divide": return "operator_/";
        case "Modulo": return "operator_%";
        case "Power": return "operator_**";
        case "LeftShift": return "operator_<<";
        case "RightShift": return "operator_>>";
        case "LogicalOr": return "operator_||";
        case "LogicalAnd": return "operator_&&";
        case "BitwiseOr": return "operator_|";
        case "BitwiseAnd": return "operator_&";
        case "ExclusiveOr": return "operator_^";
        case "Equals": return "operator_==";
        case "NotEquals": return "operator_!=";
        case "LessThan": return "operator_<";
        case "LessThanOrEqual": return "operator_<=";
        case "GreaterThan": return "operator_>";
        case "GreaterThanOrEqual": return "operator_>=";
        case "Coalesce": return "operator_??";
        case "Index": return "operator_[]";
        default: throw new Error(`Invalid operator id`);
    }
}

export class OperatorSymbol extends MemberSymbol {
    readonly kind = SymbolKind.Operator;
    readonly name: string;
    readonly isReadOnly = true;
    readonly isStatic = true;
    constructor(
        readonly id: UnaryOperatorId | BinaryOperatorId,
        readonly type: TypeSymbol,
        readonly operands: (readonly [TypeSymbol] | readonly [TypeSymbol, TypeSymbol]),
        readonly containingSymbol: TypeSymbol,
        readonly syntax: SyntaxNode | undefined) {
        super();
        this.name = makeOperatorName(id, ...operands);
    }
}

export class VariableSymbol implements ISymbol {
    readonly kind = SymbolKind.Variable;
    get fullName() { return getFullName(this.name, this.containingSymbol); }
    get containingSymbol() { return this.containingModule; }
    constructor(
        readonly name: string,
        readonly type: TypeSymbol,
        readonly containingModule: ModuleSymbol,
        readonly isReadOnly: boolean,
        readonly isStatic: boolean,
        readonly syntax: SyntaxNode | undefined) { }
}
