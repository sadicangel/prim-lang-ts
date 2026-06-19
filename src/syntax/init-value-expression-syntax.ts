import { SyntaxKind } from "../syntax-kind.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";

export class InitValueExpressionSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.InitValueExpression;
    children(): Iterator<SyntaxNode> {
        throw new Error("Method not implemented.");
    }

}