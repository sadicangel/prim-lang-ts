import { SyntaxKind, type TypeSyntaxKind } from "../syntax-kind.js";
import type { SeparatedSyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { ExpressionSyntax } from "./expression-syntax.js";
import type { NameSyntax } from "./name-syntax.js";

export type TypeSyntax = ArrayTypeSyntax | LambdaTypeSyntax | MaybeTypeSyntax | NamedTypeSyntax | PointerTypeSyntax | PredefinedTypeSyntax | UnionTypeSyntax | ErrorTypeSyntax;

export class ArrayTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ArrayType;
    constructor(
        readonly elementType: TypeSyntax,
        readonly bracketOpenToken: SyntaxToken,
        readonly length: ExpressionSyntax | undefined,
        readonly bracketCloseToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        yield this.elementType;
        yield this.bracketOpenToken;
        if (this.length) yield this.length;
        yield this.bracketCloseToken;
    }
}

export class LambdaTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.LambdaType;
    constructor(
        readonly parenthesisOpenToken: SyntaxToken,
        readonly parameters: SeparatedSyntaxList<TypeSyntax, SyntaxKind.CommaToken>,
        readonly parenthesisCloseToken: SyntaxToken,
        readonly arrowReturnToken: SyntaxToken,
        readonly returnType: TypeSyntax) { }

    * children(): Iterator<SyntaxNode> {
        yield this.parenthesisOpenToken;
        for (const parameter of this.parameters.syntaxNodes) yield parameter;
        yield this.parenthesisCloseToken;
        yield this.arrowReturnToken;
        yield this.returnType;
    }
}

export class MaybeTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.MaybeType;
    constructor(
        readonly underlyingType: TypeSyntax,
        readonly hookToken: SyntaxToken) { }

    * children(): Iterator<SyntaxNode> {
        yield this.underlyingType;
        yield this.hookToken;
    }
}

export class NamedTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.NamedType;
    constructor(readonly name: NameSyntax) { }

    * children(): Iterator<SyntaxNode> { yield this.name; }
}

export class PointerTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.PointerType;
    constructor(
        readonly elementType: TypeSyntax,
        readonly asteriskToken: SyntaxToken) { }

    * children(): Iterator<SyntaxNode> {
        yield this.elementType;
        yield this.asteriskToken;
    }
}

export class PredefinedTypeSyntax implements ISyntaxNode {
    constructor(readonly syntaxKind: TypeSyntaxKind, readonly typeKeyword: SyntaxToken) { }
    * children(): Iterator<SyntaxNode> { yield this.typeKeyword; }

}

export class ErrorTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ErrorType;
    constructor(readonly errorToken: SyntaxToken) { }
    *children(): Iterator<SyntaxNode> { yield this.errorToken; }
}

export class UnionTypeSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.UnionType;
    constructor(readonly types: SeparatedSyntaxList<TypeSyntax, SyntaxKind.BarToken>) { }

    *children(): Iterator<SyntaxNode> {
        for (const node of this.types.syntaxNodes) yield node;
    }
}
