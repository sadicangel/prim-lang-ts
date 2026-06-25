import { SyntaxFacts } from "../syntax-facts.js";
import { SyntaxKind, type LiteralSyntaxKind } from "../syntax-kind.js";
import type { SeparatedSyntaxList, SyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { LocalDeclarationSyntax } from "./declaration-syntax.js";
import type { NameSyntax, SimpleNameSyntax } from "./name-syntax.js";
import type { ExpressionStatementSyntax } from "./statement-syntax.js";
import type { TypeSyntax } from "./type-syntax.js";

export type ExpressionSyntax = ModuleExpressionSyntax | StructExpressionSyntax | BlockExpressionSyntax | GroupExpressionSyntax | LambdaExpressionSyntax | ArrayInitializerExpressionSyntax | LiteralExpressionSyntax | NameExpressionSyntax | UnaryExpressionSyntax | BinaryExpressionSyntax | AssignmentExpression | InvocationExpressionSyntax | ObjectInitializerExpressionSyntax | PropertyInitializerExpression | ElementAccessExpressionSyntax | MemberAccessExpressionSyntax | ConversionExpressionSyntax | IfElseExpressionSyntax | WhileExpressionSyntax | ContinueExpressionSyntax | BreakExpressionSyntax | ReturnExpressionSyntax;

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

export type BlockItemSyntax = LocalDeclarationSyntax | ExpressionStatementSyntax | ExpressionSyntax;

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
        readonly location: ExpressionSyntax,
        readonly equalsToken: SyntaxToken,
        readonly value: ExpressionSyntax) { }
    *children(): Iterator<SyntaxNode> {
        yield this.location;
        yield this.equalsToken;
        yield this.value;
    }
}

export class InvocationExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.InvocationExpression;
    constructor(
        readonly callee: ExpressionSyntax,
        readonly parenthesisOpenToken: SyntaxToken,
        readonly arguments_: SeparatedSyntaxList<ExpressionSyntax, SyntaxKind.CommaToken>,
        readonly parenthesisCloseToken: SyntaxToken) { }
    * children(): Iterator<SyntaxNode> {
        {
            yield this.callee;
            yield this.parenthesisOpenToken;
            for (const argument of this.arguments_.syntaxNodes) yield argument;
            yield this.parenthesisCloseToken;
        }
    }
}

export class ObjectInitializerExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ObjectInitializerExpression;
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

export class IfElseExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.IfElseExpression;
    constructor(
        readonly ifKeyword: SyntaxToken,
        readonly parenthesisOpenToken: SyntaxToken,
        readonly condition: ExpressionSyntax,
        readonly parenthesisCloseToken: SyntaxToken,
        readonly then: ExpressionSyntax,
        readonly elseClause: ElseClauseExpressionSyntax | undefined) { }

    *children(): Iterator<SyntaxNode> {
        yield this.ifKeyword;
        yield this.parenthesisOpenToken;
        yield this.condition;
        yield this.parenthesisCloseToken;
        yield this.then;
        if (this.elseClause) yield this.elseClause;
    }
}

export class ElseClauseExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ElseClause;
    constructor(
        readonly elseKeyword: SyntaxToken,
        readonly expression: ExpressionSyntax) { }

    *children(): Iterator<SyntaxNode> {
        yield this.elseKeyword;
        yield this.expression;
    }
}

export class WhileExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.WhileExpression;
    constructor(
        readonly whileKeyword: SyntaxToken,
        readonly parenthesisOpenToken: SyntaxToken,
        readonly condition: ExpressionSyntax,
        readonly parenthesisCloseToken: SyntaxToken,
        readonly body: ExpressionSyntax) { }

    *children(): Iterator<SyntaxNode> {
        yield this.whileKeyword;
        yield this.parenthesisOpenToken;
        yield this.condition;
        yield this.parenthesisCloseToken;
        yield this.body;
    }
}

export class ContinueExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ContinueExpression;
    constructor(
        readonly continueKeyword: SyntaxToken,
        readonly expression: ExpressionSyntax | undefined) { }
    *children(): Iterator<SyntaxNode> { yield this.continueKeyword; }
}

export class BreakExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.BreakExpression;
    constructor(
        readonly breakKeyword: SyntaxToken,
        readonly expression: ExpressionSyntax | undefined) { }

    *children(): Iterator<SyntaxNode> {
        yield this.breakKeyword;
        if (this.expression) yield this.expression;
    }
}

export class ReturnExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ReturnExpression;
    constructor(
        readonly returnKeyword: SyntaxToken,
        readonly expression: ExpressionSyntax | undefined) { }

    *children(): Iterator<SyntaxNode> {
        yield this.returnKeyword;
        if (this.expression) yield this.expression;
    }
}
