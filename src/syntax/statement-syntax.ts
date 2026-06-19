import { SyntaxKind } from "../syntax-kind.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { ExpressionSyntax } from "./expression-syntax.js";


export class StatementSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.ExpressionStatement;
    constructor(readonly expression: ExpressionSyntax, readonly semicolonToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        yield this.expression;
        yield this.semicolonToken;
    }
}
