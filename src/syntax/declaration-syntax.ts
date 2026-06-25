import { SyntaxKind } from "../syntax-kind.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { ExpressionSyntax } from "./expression-syntax.js";
import type { NameSyntax, SimpleNameSyntax } from "./name-syntax.js";
import type { TypeSyntax } from "./type-syntax.js";

export const isReadOnly = (declaration: GlobalDeclarationSyntax | LocalDeclarationSyntax): boolean => {
    return declaration.operatorToken?.syntaxKind === SyntaxKind.ColonToken;
}

export const isStatic = (declaration: GlobalDeclarationSyntax | LocalDeclarationSyntax): boolean => {
    return declaration.syntaxKind === SyntaxKind.GlobalDeclaration;
}

export class GlobalDeclarationSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.GlobalDeclaration;

    constructor(
        readonly name: NameSyntax,
        readonly colonToken: SyntaxToken,
        readonly type: TypeSyntax | undefined,
        readonly operatorToken: SyntaxToken,
        readonly initializer: ExpressionSyntax,
        readonly semicolonToken: SyntaxToken
    ) { }

    *children(): Iterator<SyntaxNode> {
        yield this.name;
        yield this.colonToken;
        if (this.type) yield this.type;
        yield this.operatorToken;
        yield this.initializer;
        yield this.semicolonToken;
    }
}

export class LocalDeclarationSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.LocalDeclaration;

    constructor(
        readonly name: SimpleNameSyntax,
        readonly colonToken: SyntaxToken,
        readonly type: TypeSyntax | undefined,
        readonly operatorToken: SyntaxToken | undefined,
        readonly initializer: ExpressionSyntax | undefined,
        readonly semicolonToken: SyntaxToken
    ) { }

    *children(): Iterator<SyntaxNode> {
        yield this.name;
        yield this.colonToken;
        if (this.type) yield this.type;
        if (this.operatorToken) yield this.operatorToken;
        if (this.initializer) yield this.initializer;
        yield this.semicolonToken;
    }
}