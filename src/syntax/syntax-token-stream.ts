import { SyntaxKind } from "../syntax-kind.js";
import { SyntaxToken } from "../syntax-token.js";


export class SyntaxTokenStream {
    #tokens: readonly SyntaxToken[];
    #offset: number;

    constructor(syntaxTokens: Iterable<SyntaxToken>) {
        this.#tokens = Array.from(syntaxTokens);
        this.#offset = 0;
    }

    get isAtEnd(): boolean { return this.peek().syntaxKind === SyntaxKind.EofToken; }

    peek(offset = 0): SyntaxToken {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.#tokens[this.#offset + offset] ?? this.#tokens.at(-1)!;
    }

    next(): SyntaxToken {
        const current = this.peek();
        if (this.#offset < this.#tokens.length) this.#offset += 1;
        return current;
    }

    skip(count = 1): void {
        this.#offset = Math.min(this.#offset + count, this.#tokens.length - 1);
    }

    checkpoint() {
        const offset = this.#offset;
        return { reset: () => { this.#offset = offset; } };
    }
}
