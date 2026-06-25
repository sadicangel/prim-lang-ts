import type { SyntaxNode } from "../syntax-node.js";
import { BoundKind } from "./bound-kind.js";
import { ModuleSymbol, PropertySymbol, TypeSymbol, type ArrayTypeSymbol, type IndexerSymbol, type LambdaTypeSymbol, type MemberSymbol, type OperatorSymbol, type Symbol, type VariableSymbol } from "./symbol.js";

export type BoundNode = BoundStatement | BoundExpression;

export type IBoundNode = {
    readonly kind: BoundKind;
    readonly syntax: SyntaxNode;
    children(): Iterable<BoundNode>;
}

export type IBoundExpression = IBoundNode & { readonly type: TypeSymbol; };

export type BoundStatement = BoundDeclaration | BoundExpressionStatement;

export class BoundDeclaration implements IBoundNode {
    readonly kind = BoundKind.Declaration;
    constructor(
        readonly symbol: Symbol,
        readonly initializer: BoundExpression | undefined,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { if (this.initializer) yield this.initializer; }
}

export class BoundExpressionStatement implements IBoundNode {
    readonly kind = BoundKind.ExpressionStatement;
    constructor(
        readonly expression: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.expression; }
}

export type BoundExpression = BoundLocation | BoundLiteralExpression | BoundLambdaExpression | BoundBlockExpression | BoundArrayExpression | BoundInvocationExpression | BoundObjectInitializerExpression | BoundPropertyInitializerExpression | BoundTypeExpression | BoundModuleExpression | BoundAssignmentExpression | BoundUnaryExpression | BoundBinaryExpression | BoundIfElseExpression | BoundWhileExpression | BoundBreakExpression | BoundContinueExpression | BoundReturnExpression | BoundNopExpression | BoundNeverExpression;

export type BoundLocation = BoundVariableLocation | BoundMemberLocation | BoundElementLocation;

export class BoundVariableLocation implements IBoundExpression {
    readonly kind = BoundKind.VariableLocation;
    get type(): TypeSymbol { return this.symbol.type; }
    constructor(
        readonly symbol: VariableSymbol,
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export class BoundElementLocation implements IBoundExpression {
    readonly kind = BoundKind.ElementLocation;
    get type(): TypeSymbol { return this.symbol.type; }
    constructor(
        readonly symbol: IndexerSymbol,
        readonly receiver: BoundExpression,
        readonly index: BoundExpression,
        readonly syntax: SyntaxNode) { }
    * children(): Iterable<BoundNode> {
        yield this.receiver;
        yield this.index;
    }
}

export class BoundMemberLocation implements IBoundExpression {
    readonly kind = BoundKind.MemberLocation;
    get type(): TypeSymbol { return this.symbol.type; }
    constructor(
        readonly symbol: MemberSymbol,
        readonly receiver: BoundExpression | undefined,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { if (this.receiver) yield this.receiver; }
}

export class BoundLiteralExpression implements IBoundExpression {
    readonly kind = BoundKind.LiteralExpression;
    constructor(
        readonly type: TypeSymbol,
        readonly value: unknown,
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export class BoundLambdaExpression implements IBoundExpression {
    readonly kind = BoundKind.LambdaExpression;
    constructor(
        readonly type: LambdaTypeSymbol,
        readonly parameters: readonly VariableSymbol[],
        readonly body: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.body; }
}

export class BoundBlockExpression implements IBoundExpression {
    readonly kind = BoundKind.BlockExpression;
    constructor(
        readonly type: TypeSymbol,
        readonly items: readonly BoundNode[],
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return this.items; }
}

export class BoundArrayExpression implements IBoundExpression {
    readonly kind = BoundKind.ArrayExpression;
    constructor(
        readonly type: ArrayTypeSymbol,
        readonly elements: readonly BoundExpression[],
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return this.elements; }
}

export class BoundInvocationExpression implements IBoundExpression {
    readonly kind = BoundKind.InvocationExpression;
    constructor(
        readonly type: TypeSymbol,
        readonly callee: BoundExpression,
        readonly arguments_: readonly BoundExpression[],
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> {
        yield this.callee;
        for (const argument of this.arguments_) yield argument;
    }
}

export class BoundObjectInitializerExpression implements IBoundExpression {
    readonly kind = BoundKind.ObjectInitializerExpression;
    get type() { return this.typeName.symbol; }
    constructor(
        readonly typeName: BoundTypeExpression,
        readonly properties: readonly BoundPropertyInitializerExpression[],
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return this.properties; }
}

export class BoundPropertyInitializerExpression implements IBoundExpression {
    readonly kind = BoundKind.PropertyInitializerExpression;
    get type() { return this.property.type; }
    constructor(
        readonly property: PropertySymbol,
        readonly value: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> {
        yield this.value;
    }
}

export class BoundTypeExpression implements IBoundExpression {
    readonly kind = BoundKind.TypeExpression;
    get type() { return this.symbol.type; }
    constructor(
        readonly symbol: TypeSymbol,
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export class BoundModuleExpression implements IBoundExpression {
    readonly kind = BoundKind.ModuleExpression;
    get type() { return this.symbol.type; }
    constructor(readonly symbol: ModuleSymbol, readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export class BoundAssignmentExpression implements IBoundExpression {
    readonly kind = BoundKind.AssignmentExpression;
    get type(): TypeSymbol { return this.location.type; }
    constructor(
        readonly location: BoundLocation,
        readonly value: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> {
        yield this.location;
        yield this.value;
    }
}

export class BoundUnaryExpression implements IBoundExpression {
    readonly kind = BoundKind.UnaryExpression;
    get type(): TypeSymbol { return this.operator.type; }
    constructor(
        readonly operand: BoundExpression,
        readonly operator: OperatorSymbol,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.operand; }
}

export class BoundBinaryExpression implements IBoundExpression {
    readonly kind = BoundKind.BinaryExpression;
    get type(): TypeSymbol { return this.operator.type; }
    constructor(
        readonly left: BoundExpression,
        readonly operator: OperatorSymbol,
        readonly right: BoundExpression,
        readonly syntax: SyntaxNode) { }

    *children(): Iterable<BoundNode> {
        yield this.left;
        yield this.right;
    }
}

export class BoundIfElseExpression implements IBoundExpression {
    readonly kind = BoundKind.IfElseExpression;
    constructor(
        readonly type: TypeSymbol,
        readonly condition: BoundExpression,
        readonly then: BoundExpression,
        readonly else_: BoundExpression,
        readonly syntax: SyntaxNode) { }
    * children(): Iterable<BoundNode> {
        yield this.condition;
        yield this.then;
        yield this.else_;
    }
}

export class BoundWhileExpression implements IBoundExpression {
    readonly kind = BoundKind.WhileExpression;
    get type(): TypeSymbol { return this.body.type; }
    constructor(
        readonly condition: BoundExpression,
        readonly body: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> {
        yield this.condition;
        yield this.body;
    }
}

export class BoundBreakExpression implements IBoundExpression {
    readonly kind = BoundKind.BreakExpression;
    get type(): TypeSymbol { return this.value.type; }
    constructor(
        readonly value: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.value; }
}

export class BoundContinueExpression implements IBoundExpression {
    readonly kind = BoundKind.ContinueExpression;
    get type(): TypeSymbol { return this.value.type; }
    constructor(
        readonly value: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.value; }
}

export class BoundReturnExpression implements IBoundExpression {
    readonly kind = BoundKind.ReturnExpression;
    get type(): TypeSymbol { return this.value.type; }
    constructor(
        readonly value: BoundExpression,
        readonly syntax: SyntaxNode) { }
    *children(): Iterable<BoundNode> { yield this.value; }
}

// export class BoundGotoExpression implements IBoundExpression
// export class BoundGotoIfExpression implements IBoundExpression

export class BoundNopExpression implements IBoundExpression {
    readonly kind = BoundKind.NopExpression;
    constructor(
        readonly type: TypeSymbol,
        readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export class BoundNeverExpression implements IBoundExpression {
    readonly kind = BoundKind.NeverExpression;
    constructor(readonly type: TypeSymbol, readonly syntax: SyntaxNode) { }
    children(): Iterable<BoundNode> { return []; }
}

export const isExpression = (node: BoundNode | undefined): node is BoundExpression => {
    if (!node) return false;
    switch (node.kind) {
        case BoundKind.Declaration:
        case BoundKind.ExpressionStatement:
            return false;
        case BoundKind.VariableLocation:
        case BoundKind.ElementLocation:
        case BoundKind.MemberLocation:
        case BoundKind.LiteralExpression:
        case BoundKind.LambdaExpression:
        case BoundKind.BlockExpression:
        case BoundKind.ArrayExpression:
        case BoundKind.InvocationExpression:
        case BoundKind.ObjectInitializerExpression:
        case BoundKind.PropertyInitializerExpression:
        case BoundKind.TypeExpression:
        case BoundKind.ModuleExpression:
        case BoundKind.AssignmentExpression:
        case BoundKind.UnaryExpression:
        case BoundKind.BinaryExpression:
        case BoundKind.IfElseExpression:
        case BoundKind.WhileExpression:
        case BoundKind.BreakExpression:
        case BoundKind.ContinueExpression:
        case BoundKind.ReturnExpression:
        case BoundKind.NopExpression:
        case BoundKind.NeverExpression:
            return true;
        default:
            throw new Error(`Invalid kind`);
    }
}
