import { SyntaxFacts } from "../syntax-facts.js";
import { SyntaxKind } from "../syntax-kind.js";
import type { SeparatedSyntaxList, SyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { LocalDeclarationSyntax } from "./declaration-syntax.js";
import type { NameSyntax, SimpleNameSyntax } from "./name-syntax.js";
import type { StatementSyntax } from "./statement-syntax.js";
import type { TypeSyntax } from "./type-syntax.js";

export type ExpressionSyntax = ModuleExpressionSyntax | StructExpressionSyntax | BlockExpressionSyntax | GroupExpressionSyntax | LambdaExpressionSyntax | ArrayInitializerExpressionSyntax | LiteralExpressionSyntax | NameExpressionSyntax | UnaryExpressionSyntax | BinaryExpressionSyntax | AssignmentExpression | CallExpressionSyntax | StructInitializerExpressionSyntax | ElementAccessExpressionSyntax | MemberAccessExpressionSyntax | ConversionExpressionSyntax;

export class ModuleExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ModuleExpression;
    constructor(readonly moduleKeyword: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> { yield this.moduleKeyword; }
}

export class StructExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.StructExpression;
    constructor(
        readonly structKeyword: SyntaxToken,
        readonly braceOpenToken: SyntaxToken,
        readonly properties: SyntaxList<LocalDeclarationSyntax>,
        readonly braceCloseToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        yield this.structKeyword;
        yield this.braceOpenToken;
        for (const property of this.properties.syntaxNodes) yield property;
        yield this.braceCloseToken;
    }
}

export type BlockItemSyntax = LocalDeclarationSyntax | StatementSyntax | ExpressionSyntax;

export class BlockExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.BlockExpression;
    constructor(
        readonly braceOpenToken: SyntaxToken,
        readonly items: SyntaxList<BlockItemSyntax>,
        readonly braceCloseToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        yield this.braceOpenToken;
        for (const property of this.items.syntaxNodes) yield property;
        yield this.braceCloseToken;
    }
}

export class GroupExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.GroupExpression;
    constructor(
        readonly parenthesisOpenToken: SyntaxToken,
        readonly expression: ExpressionSyntax,
        readonly parenthesisCloseToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        yield this.parenthesisOpenToken;
        yield this.expression;
        yield this.parenthesisCloseToken;
    }
}

export class LambdaExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.LambdaExpression;
    constructor(
        readonly parenthesisOpenToken: SyntaxToken,
        readonly parameters: SeparatedSyntaxList<SimpleNameSyntax, SyntaxKind.CommaToken>,
        readonly parenthesisCloseToken: SyntaxToken,
        readonly equalsGreaterThanToken: SyntaxToken,
        readonly body: ExpressionSyntax) { }

    * children(): Iterator<SyntaxNode> {
        yield this.parenthesisOpenToken;
        for (const node of this.parameters.syntaxNodes) yield node;
        yield this.parenthesisCloseToken;
        yield this.equalsGreaterThanToken;
        yield this.body;
    }
}

export class ArrayInitializerExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ArrayInitializerExpression;
    constructor(
        readonly bracketOpenToken: SyntaxToken,
        readonly elements: SeparatedSyntaxList<ExpressionSyntax, SyntaxKind.CommaToken>,
        readonly bracketCloseToken: SyntaxToken) { }
    * children(): Iterator<SyntaxNode> {
        yield this.bracketOpenToken;
        for (const element of this.elements) yield element;
        yield this.bracketCloseToken;
    }
}

export type LiteralSyntaxKind = SyntaxKind.I8LiteralExpression | SyntaxKind.U8LiteralExpression | SyntaxKind.I16LiteralExpression | SyntaxKind.U16LiteralExpression | SyntaxKind.I32LiteralExpression | SyntaxKind.U32LiteralExpression | SyntaxKind.I64LiteralExpression | SyntaxKind.U64LiteralExpression | SyntaxKind.F16LiteralExpression | SyntaxKind.F32LiteralExpression | SyntaxKind.F64LiteralExpression | SyntaxKind.StrLiteralExpression | SyntaxKind.TrueLiteralExpression | SyntaxKind.FalseLiteralExpression | SyntaxKind.NullLiteralExpression;

export class LiteralExpressionSyntax implements ISyntaxNode {
    constructor(readonly syntaxKind: LiteralSyntaxKind, readonly literalToken: SyntaxToken) { }
    *children(): Iterator<SyntaxNode> { yield this.literalToken; }
}

export class NameExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.NameExpression;
    constructor(readonly name: NameSyntax) { }
    *children(): Iterator<SyntaxNode> { yield this.name; }
}
export type UnaryExpressionSyntaxKind = SyntaxKind.UnaryPlusExpression | SyntaxKind.UnaryMinusExpression | SyntaxKind.OnesComplementExpression | SyntaxKind.NotExpression;

export class UnaryExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind: UnaryExpressionSyntaxKind;
    constructor(
        readonly operatorToken: SyntaxToken,
        readonly operand: ExpressionSyntax) {
        this.syntaxKind = SyntaxFacts.getUnaryOperatorExpression(operatorToken.syntaxKind);
    }
    *children(): Iterator<SyntaxNode> {
        yield this.operatorToken;
        yield this.operand;
    }
}

export type BinaryExpressionSyntaxKind = SyntaxKind.AddExpression | SyntaxKind.SubtractExpression | SyntaxKind.MultiplyExpression | SyntaxKind.DivideExpression | SyntaxKind.ModuloExpression | SyntaxKind.PowerExpression | SyntaxKind.LeftShiftExpression | SyntaxKind.RightShiftExpression | SyntaxKind.LogicalOrExpression | SyntaxKind.LogicalAndExpression | SyntaxKind.BitwiseOrExpression | SyntaxKind.BitwiseAndExpression | SyntaxKind.ExclusiveOrExpression | SyntaxKind.EqualsExpression | SyntaxKind.NotEqualsExpression | SyntaxKind.LessThanExpression | SyntaxKind.LessThanOrEqualExpression | SyntaxKind.GreaterThanExpression | SyntaxKind.GreaterThanOrEqualExpression | SyntaxKind.CoalesceExpression;

export class BinaryExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind: BinaryExpressionSyntaxKind;
    constructor(
        readonly left: ExpressionSyntax,
        readonly operatorToken: SyntaxToken,
        readonly right: ExpressionSyntax) {
        this.syntaxKind = SyntaxFacts.getBinaryOperatorExpression(operatorToken.syntaxKind);
    }
    *children(): Iterator<SyntaxNode> {
        yield this.left;
        yield this.operatorToken;
        yield this.right;
    }
}

export class AssignmentExpression implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.AssignmentExpression;
    constructor(
        readonly left: ExpressionSyntax,
        readonly equalsToken: SyntaxToken,
        readonly right: ExpressionSyntax) { }
    *children(): Iterator<SyntaxNode> {
        yield this.left;
        yield this.equalsToken;
        yield this.right;
    }
}

export class CallExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.CallExpression;
    constructor(
        readonly callee: ExpressionSyntax,
        readonly parenthesisOpenToken: SyntaxToken,
        readonly argumentList: SeparatedSyntaxList<ExpressionSyntax, SyntaxKind.CommaToken>,
        readonly parenthesisCloseToken: SyntaxToken) { }
    * children(): Iterator<SyntaxNode> {
        {
            yield this.callee;
            yield this.parenthesisOpenToken;
            for (const argument of this.argumentList.syntaxNodes) yield argument;
            yield this.parenthesisCloseToken;
        }
    }
}

export class StructInitializerExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.StructInitializerExpression;
    constructor(
        readonly typeName: ExpressionSyntax,
        readonly braceOpenToken: SyntaxToken,
        readonly properties: SeparatedSyntaxList<PropertyInitializerExpression, SyntaxKind.CommaToken>,
        readonly braceCloseToken: SyntaxToken) { }

    * children(): Iterator<SyntaxNode> {
        yield this.typeName;
        yield this.braceOpenToken;
        for (const property of this.properties.syntaxNodes) yield property;
        yield this.braceCloseToken;
    }
}

export class ElementAccessExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ElementAccessExpression;
    constructor(
        readonly receiver: ExpressionSyntax,
        readonly bracketOpenToken: SyntaxToken,
        readonly index: ExpressionSyntax,
        readonly bracketCloseToken: SyntaxToken) { }
    * children(): Iterator<SyntaxNode> {
        yield this.receiver;
        yield this.bracketOpenToken;
        yield this.index;
        yield this.bracketCloseToken;
    }
}

export class MemberAccessExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.MemberAccessExpression;
    constructor(
        readonly receiver: ExpressionSyntax,
        readonly dotToken: SyntaxToken,
        readonly memberName: SimpleNameSyntax) { }
    * children(): Iterator<SyntaxNode> {
        yield this.receiver;
        yield this.dotToken;
        yield this.memberName;
    }
}

export class ConversionExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ConversionExpression;
    constructor(
        readonly expression: ExpressionSyntax,
        readonly asKeyword: SyntaxToken,
        readonly type: TypeSyntax) { }

    * children(): Iterator<SyntaxNode> {
        yield this.expression;
        yield this.asKeyword;
        yield this.type;
    }
}

export class PropertyInitializerExpression implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.PropertyInitializerExpression;
    constructor(
        readonly propertyName: SimpleNameSyntax,
        readonly equalsToken: SyntaxToken,
        readonly propertyValue: ExpressionSyntax) { }
    * children(): Iterator<SyntaxNode> {
        yield this.propertyName;
        yield this.equalsToken;
        yield this.propertyValue;
    }
}
