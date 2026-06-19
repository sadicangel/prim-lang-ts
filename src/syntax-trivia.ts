import type { SyntaxKind } from "./syntax-kind.js";
import type { ISyntaxNode, SyntaxNode } from "./syntax-node.js";
import type { SourceSpan } from "./text/source-span.js";


export class SyntaxTrivia implements ISyntaxNode {
    constructor(readonly syntaxKind: SyntaxKind, readonly sourceSpan: SourceSpan) { }
    *children(): Iterator<SyntaxNode> { yield* []; }
}
