import type { ISyntaxNode, SyntaxNode } from "./syntax-node.js";
import type { KeywordSyntaxKind, SyntaxTokenKind } from "./syntax-kind.js"
import type { SyntaxTrivia } from "./syntax-trivia.js";
import type { SourceSpan } from "./text/source-span.js";

export type LexerSyntaxKind = SyntaxTokenKind | KeywordSyntaxKind;

export type SyntaxTokenOf<T extends LexerSyntaxKind> = SyntaxToken & { syntaxKind: T };

export class SyntaxToken implements ISyntaxNode {
    constructor(
        readonly syntaxKind: LexerSyntaxKind,
        readonly sourceSpan: SourceSpan,
        readonly leadingTrivia: readonly SyntaxTrivia[],
        readonly trailingTrivia: readonly SyntaxTrivia[],
        readonly value: unknown,
        readonly isSynthetic = false) { }

    *children(): Iterator<SyntaxNode> { yield* []; }

    getText() { return this.sourceSpan.getText(); }
    getValueText() { return typeof this.value === 'string' ? this.value : this.getText(); }
}
