import { SyntaxKind } from "../syntax-kind.js";
import type { SeparatedSyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";

export type NameSyntax = SimpleNameSyntax | QualifiedNameSyntax;

export class SimpleNameSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.SimpleName;
    constructor(readonly identifierToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> { yield this.identifierToken; }
}

export class QualifiedNameSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.QualifiedName;
    constructor(readonly identifierTokens: SeparatedSyntaxList<SyntaxToken, SyntaxKind.DotToken>) { }

    *children(): Iterator<SyntaxNode> {
        for (const node of this.identifierTokens.syntaxNodes)
            yield node;
    }

}

