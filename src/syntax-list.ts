import type { SyntaxTokenKind } from "./syntax-kind.js";
import type { SyntaxNode } from "./syntax-node.js"
import type { SyntaxToken, SyntaxTokenOf } from "./syntax-token.js";

export class SyntaxList<T extends SyntaxNode> implements ArrayLike<T>, Iterable<T> {
    get length(): number { return this.syntaxNodes.length; }
    [index: number]: T;
    *[Symbol.iterator](): Iterator<T> { for (const node of this.syntaxNodes) yield node; }

    constructor(readonly syntaxNodes: T[]) {
        return new Proxy(this, {
            get(target, property, receiver) {
                if (typeof property === 'string') {
                    const index = Number(property);
                    if (Number.isInteger(index)) {
                        if (index < 0 || index >= target.length)
                            throw new Error("index out of bounds");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return target.syntaxNodes[index]!;
                    }
                }

                return Reflect.get(target, property, receiver);
            }
        })
    }
}

export type SyntaxOrSeparator<TSyntax extends SyntaxNode, TSeparator extends SyntaxTokenKind> = TSyntax | SyntaxTokenOf<TSeparator>;
export class SeparatedSyntaxList<TSyntax extends SyntaxNode, TSeparator extends SyntaxTokenKind> implements ArrayLike<TSyntax>, Iterable<TSyntax> {
    get length(): number { return Math.ceil(this.syntaxNodes.length / 2); }
    [index: number]: TSyntax;
    *[Symbol.iterator](): Iterator<TSyntax> { for (let i = 0; i < this.length; ++i) yield this.syntaxNodes[i * 2] as TSyntax; }

    constructor(readonly syntaxNodes: SyntaxOrSeparator<TSyntax, TSeparator>[]) {
        return new Proxy(this, {
            get(target, property, receiver) {
                if (typeof property === 'string') {
                    const index = Number(property);
                    if (Number.isInteger(index)) {
                        if (index < 0 || index >= target.length)
                            throw new Error("index out of bounds");
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        return target.syntaxNodes[index * 2]! as TSyntax;
                    }
                }

                return Reflect.get(target, property, receiver);
            }
        })
    }

    separatorAt(index: number): SyntaxToken & { syntaxKind: TSeparator } {
        if (index < 0 || index * 2 + 1 >= this.syntaxNodes.length)
            throw new Error("index out of bounds");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.syntaxNodes[index * 2 + 1]! as SyntaxToken & { syntaxKind: TSeparator };
    }
}
