import { SyntaxKind } from "../syntax-kind.js";
import type { SyntaxList } from "../syntax-list.js";
import type { ISyntaxNode, SyntaxNode } from "../syntax-node.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { GlobalDeclarationSyntax } from "./declaration-syntax.js";


export class CompilationUnitSyntax implements ISyntaxNode {
    readonly syntaxKind = SyntaxKind.CompilationUnit;
    constructor(readonly declarations: SyntaxList<GlobalDeclarationSyntax>, readonly eofToken: SyntaxToken) { }

    *children(): Iterator<SyntaxNode> {
        for (const syntaxNode of this.declarations)
            yield syntaxNode;
        yield this.eofToken;
    }

}
