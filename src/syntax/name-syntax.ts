import { SyntaxKind } from "../syntax-kind.js";
import type { SeparatedSyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";

export type NameSyntax = SimpleNameSyntax | QualifiedNameSyntax;

export type INameSyntax = {
    getName(): string;
    getFullName(): string;
    getNameParts(): Iterable<string>
} & ISyntaxNode

export class SimpleNameSyntax implements INameSyntax {
    readonly syntaxKind = SyntaxKind.SimpleName;
    constructor(readonly identifierToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> { yield this.identifierToken; }

    getName(): string { return this.identifierToken.getValueText(); }
    getFullName(): string { return this.identifierToken.getValueText(); }
    *getNameParts(): Iterable<string> { yield this.identifierToken.getValueText(); }
}

export class QualifiedNameSyntax implements INameSyntax {
    readonly syntaxKind = SyntaxKind.QualifiedName;
    constructor(readonly identifierTokens: SeparatedSyntaxList<SyntaxToken, SyntaxKind.DotToken>) { }

    *children(): Iterator<SyntaxNode> {
        for (const node of this.identifierTokens.syntaxNodes)
            yield node;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    getName(): string { return this.identifierTokens[this.identifierTokens.length - 1]!.getValueText(); }
    getFullName(): string { return Array.from(this.getNameParts()).join('.'); } // TODO: Maybe we should use the actual syntax token text?
    *getNameParts(): Iterable<string> { for (const identifier of this.identifierTokens) yield identifier.getValueText(); }

}

