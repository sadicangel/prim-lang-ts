import { Diagnostic } from "../diagnostics/diagnostic.js";
import { SyntaxFacts } from "../syntax-facts.js";
import { SyntaxKind } from "../syntax-kind.js";
import { SeparatedSyntaxList, SyntaxList, type SyntaxOrSeparator } from "../syntax-list.js";
import { SyntaxToken, type SyntaxTokenOf } from "../syntax-token.js";
import { Range } from "../text/range.js";
import { SourceSpan } from "../text/source-span.js";
import { CompilationUnitSyntax } from "./compilation-unit-syntax.js";
import { GlobalDeclarationSyntax, LocalDeclarationSyntax } from "./declaration-syntax.js";
import { ArrayInitializerExpressionSyntax, AssignmentExpression, BinaryExpressionSyntax, BlockExpressionSyntax, type BlockItemSyntax, CallExpressionSyntax, ConversionExpressionSyntax, ElementAccessExpressionSyntax, type ExpressionSyntax, GroupExpressionSyntax, LambdaExpressionSyntax, LiteralExpressionSyntax, MemberAccessExpressionSyntax, ModuleExpressionSyntax, NameExpressionSyntax, PropertyInitializerExpression, StructExpressionSyntax, StructInitializerExpressionSyntax, UnaryExpressionSyntax } from "./expression-syntax.js";
import { QualifiedNameSyntax, SimpleNameSyntax, type NameSyntax } from "./name-syntax.js";
import { StatementSyntax } from "./statement-syntax.js";
import type { SyntaxTokenStream } from "./syntax-token-stream.js";
import { ArrayTypeSyntax, ErrorTypeSyntax, LambdaTypeSyntax, MaybeTypeSyntax, NamedTypeSyntax, PointerTypeSyntax, PredefinedTypeSyntax, type TypeSyntax, UnionTypeSyntax } from "./type-syntax.js";

export class Parser {
    #stream: SyntaxTokenStream;
    #diagnostics = new Array<Diagnostic>();

    constructor(stream: SyntaxTokenStream) {
        this.#stream = stream;
    }

    get diagnostics(): readonly Diagnostic[] {
        return this.#diagnostics;
    }

    reset(stream: SyntaxTokenStream) {
        this.#stream = stream;
        this.#diagnostics.length = 0;
    }

    parse(): CompilationUnitSyntax {
        return this.#parseCompilationUnit();
    }

    #parseCompilationUnit(): CompilationUnitSyntax {
        const declarations = new Array<GlobalDeclarationSyntax>();
        while (!this.#stream.isAtEnd) {
            declarations.push(this.#parseGlobalDeclaration());
        }
        const eofToken = this.#match(SyntaxKind.EofToken);
        return new CompilationUnitSyntax(new SyntaxList(declarations), eofToken);
    }

    #parseName(opts: { isSimpleOnly: true, allowPrimiveTypes?: boolean }): SimpleNameSyntax;
    #parseName(opts?: { isSimpleOnly?: false, allowPrimiveTypes?: boolean }): NameSyntax;
    #parseName(opts: { isSimpleOnly?: boolean, allowPrimiveTypes?: boolean } = {}): NameSyntax {
        const matchIdentifier = !opts.allowPrimiveTypes
            ? () => this.#match(SyntaxKind.IdentifierToken)
            : () => this.#matchAny(
                SyntaxKind.IdentifierToken,
                SyntaxKind.AnyKeyword,
                SyntaxKind.ErrKeyword,
                SyntaxKind.UnknownKeyword,
                SyntaxKind.NeverKeyword,
                SyntaxKind.UnitKeyword,
                SyntaxKind.TypeKeyword,
                SyntaxKind.StrKeyword,
                SyntaxKind.BoolKeyword,
                SyntaxKind.I8Keyword,
                SyntaxKind.I16Keyword,
                SyntaxKind.I32Keyword,
                SyntaxKind.I64Keyword,
                SyntaxKind.IszKeyword,
                SyntaxKind.U8Keyword,
                SyntaxKind.U16Keyword,
                SyntaxKind.U32Keyword,
                SyntaxKind.U64Keyword,
                SyntaxKind.UszKeyword,
                SyntaxKind.F16Keyword,
                SyntaxKind.F32Keyword,
                SyntaxKind.F64Keyword);
        const identifier = matchIdentifier();
        if (opts.isSimpleOnly || this.#stream.peek().syntaxKind !== SyntaxKind.DotToken)
            return new SimpleNameSyntax(identifier);

        const syntaxNodes: SyntaxOrSeparator<typeof identifier, SyntaxKind.DotToken>[] = [identifier];
        do {
            syntaxNodes.push(this.#match(SyntaxKind.DotToken));
            syntaxNodes.push(matchIdentifier());
        }
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind === SyntaxKind.DotToken);

        return new QualifiedNameSyntax(new SeparatedSyntaxList(syntaxNodes));
    }

    #parseType(endingKinds: readonly SyntaxKind[] = []): TypeSyntax {
        const syntaxNodes = new Array<SyntaxOrSeparator<TypeSyntax, SyntaxKind.BarToken>>();
        syntaxNodes.push(this.#parsePostfixType(endingKinds));
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind === SyntaxKind.BarToken) {
            syntaxNodes.push(this.#match(SyntaxKind.BarToken));
            syntaxNodes.push(this.#parsePostfixType(endingKinds));
        }

        return syntaxNodes.length === 1
            ? syntaxNodes[0] as TypeSyntax
            : new UnionTypeSyntax(new SeparatedSyntaxList(syntaxNodes));
    }

    #parsePostfixType(endingKinds: readonly SyntaxKind[]): TypeSyntax {
        let type = this.#parsePrimaryType(endingKinds);

        while (true) {
            if (this.#stream.peek().syntaxKind === SyntaxKind.BracketOpenToken) {
                const bracketOpenToken = this.#match(SyntaxKind.BracketOpenToken);
                const length = this.#stream.peek().syntaxKind !== SyntaxKind.BracketCloseToken ? this.#parseExpression() : undefined;
                const bracketCloseToken = this.#match(SyntaxKind.BracketCloseToken);
                type = new ArrayTypeSyntax(type, bracketOpenToken, length, bracketCloseToken);
            } else if (this.#stream.peek().syntaxKind === SyntaxKind.AsteriskToken) {
                const asteriskToken = this.#match(SyntaxKind.AsteriskToken);
                type = new PointerTypeSyntax(type, asteriskToken);
            } else if (this.#stream.peek().syntaxKind === SyntaxKind.HookToken) {
                const hookToken = this.#match(SyntaxKind.HookToken);
                type = new MaybeTypeSyntax(type, hookToken);
            } else {
                break;
            }
        }

        return type;
    }

    #parsePrimaryType(endingKinds: readonly SyntaxKind[]): TypeSyntax {
        let type: TypeSyntax;
        const predefinedTypeKind = SyntaxFacts.getPredefinedTypeKind(this.#stream.peek().syntaxKind);
        if (predefinedTypeKind) {
            type = new PredefinedTypeSyntax(predefinedTypeKind, this.#stream.next());
        }
        else if (this.#stream.peek().syntaxKind === SyntaxKind.ParenthesisOpenToken) {
            const parenthesisOpenToken = this.#match(SyntaxKind.ParenthesisOpenToken);
            const parameters = new Array<SyntaxOrSeparator<TypeSyntax, SyntaxKind.CommaToken>>();
            while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.ParenthesisCloseToken) {
                parameters.push(this.#parseType([SyntaxKind.CommaToken, SyntaxKind.ParenthesisCloseToken]));
                if (this.#stream.peek().syntaxKind !== SyntaxKind.CommaToken) break;
                parameters.push(this.#match(SyntaxKind.CommaToken));
            }
            const parenthesisCloseToken = this.#match(SyntaxKind.ParenthesisCloseToken);
            const arrowToken = this.#match(SyntaxKind.MinusGreaterThanToken);
            const returnType = this.#parseType(endingKinds);
            type = new LambdaTypeSyntax(parenthesisOpenToken, new SeparatedSyntaxList(parameters), parenthesisCloseToken, arrowToken, returnType);
        } else if (this.#stream.peek().syntaxKind === SyntaxKind.IdentifierToken) {
            const name = this.#parseName();
            type = new NamedTypeSyntax(name);
        } else {
            return this.#createErrorType(endingKinds);
        }

        return type;
    }

    #createErrorType(endingKinds: readonly SyntaxKind[]): ErrorTypeSyntax {
        const actual = this.#stream.peek();
        const isExpectedTerminator = actual.syntaxKind === SyntaxKind.EofToken
            || actual.syntaxKind === SyntaxKind.BarToken
            || endingKinds.includes(actual.syntaxKind);
        this.#diagnostics.push(Diagnostic.unexpectedToken(SyntaxKind.IdentifierToken, actual));
        if (!isExpectedTerminator)
            this.#stream.skip();
        const sourceSpan = new SourceSpan(
            actual.sourceSpan.sourceText,
            Range.emptyAt(actual.sourceSpan.range.start));
        const errorToken = new SyntaxToken(
            SyntaxKind.IdentifierToken,
            sourceSpan,
            [],
            [],
            undefined,
            true);
        return new ErrorTypeSyntax(errorToken);
    }

    #parseGlobalDeclaration(): GlobalDeclarationSyntax {
        const name = this.#parseName();
        const colonToken = this.#match(SyntaxKind.ColonToken);
        const type = this.#parseType([SyntaxKind.ColonToken, SyntaxKind.EqualsToken]);
        const operatorToken = this.#matchAny(SyntaxKind.ColonToken, SyntaxKind.EqualsToken);
        const initializer = this.#parseExpression();
        const semicolonToken = this.#match(SyntaxKind.SemicolonToken);
        return new GlobalDeclarationSyntax(name, colonToken, type, operatorToken, initializer, semicolonToken);
    }

    #parseLocalDeclaration(): LocalDeclarationSyntax {
        const name = this.#parseName({ isSimpleOnly: true });
        const colonToken = this.#match(SyntaxKind.ColonToken);
        const type = this.#parseType([SyntaxKind.ColonToken, SyntaxKind.EqualsToken]);
        const operatorToken = this.#matchAny(SyntaxKind.ColonToken, SyntaxKind.EqualsToken);
        const initializer = this.#parseExpression();
        const semicolonToken = this.#match(SyntaxKind.SemicolonToken);
        return new LocalDeclarationSyntax(name, colonToken, type, operatorToken, initializer, semicolonToken);
    }

    #parseExpression(parentPrecedence = 0): ExpressionSyntax {
        const unaryPrecedence = SyntaxFacts.getUnaryOperatorPrecedence(this.#stream.peek().syntaxKind);
        if (unaryPrecedence > parentPrecedence) {
            const operatorToken = this.#stream.next();
            const operand = this.#parseExpression(unaryPrecedence);
            return new UnaryExpressionSyntax(operatorToken, operand);
        }

        let expression: ExpressionSyntax;
        switch (this.#stream.peek().syntaxKind) {
            case SyntaxKind.ModuleKeyword:
                expression = this.#parseExpression_Module(); break;
            case SyntaxKind.StructKeyword:
                expression = this.#parseExpression_Struct(); break;
            // case SyntaxKind.WhileKeyword: expression = undefined; break;
            // case SyntaxKind.BreakKeyword: expression = undefined; break;
            // case SyntaxKind.ContinueKeyword: expression = undefined; break;
            // case SyntaxKind.ReturnKeyword: expression = undefined; break;
            case SyntaxKind.BraceOpenToken:
                expression = this.#parseExpression_Block(); break;
            case SyntaxKind.ParenthesisOpenToken:
                expression = !this.#isLambdaAhead() ? this.#parseExpression_Group() : this.#parseExpression_Lambda(); break;
            case SyntaxKind.BracketOpenToken:
                expression = this.#parseExpression_ArrayInitializer(); break;
            case SyntaxKind.TrueKeyword:
            case SyntaxKind.FalseKeyword:
            case SyntaxKind.NullKeyword:
            case SyntaxKind.I8LiteralToken:
            case SyntaxKind.U8LiteralToken:
            case SyntaxKind.I16LiteralToken:
            case SyntaxKind.U16LiteralToken:
            case SyntaxKind.I32LiteralToken:
            case SyntaxKind.U32LiteralToken:
            case SyntaxKind.I64LiteralToken:
            case SyntaxKind.U64LiteralToken:
            case SyntaxKind.F16LiteralToken:
            case SyntaxKind.F32LiteralToken:
            case SyntaxKind.F64LiteralToken:
            case SyntaxKind.StrLiteralToken:
                expression = this.#parseExpression_Literal(); break;
            default:
                expression = this.#parseExpression_Name(); break;
        }

        while (true) {
            switch (this.#stream.peek().syntaxKind) {
                case SyntaxKind.EqualsToken: {
                    const equalsToken = this.#stream.next();
                    const right = this.#parseExpression();
                    expression = new AssignmentExpression(expression, equalsToken, right);
                } continue;

                case SyntaxKind.BraceOpenToken: {
                    const braceOpenToken = this.#match(SyntaxKind.BraceOpenToken);
                    const properties = new Array<SyntaxOrSeparator<PropertyInitializerExpression, SyntaxKind.CommaToken>>();
                    while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.BraceCloseToken) {
                        const propertyName = this.#parseName({ isSimpleOnly: true });
                        const equalsToken = this.#match(SyntaxKind.EqualsToken);
                        const propertyValue = this.#parseExpression();
                        properties.push(new PropertyInitializerExpression(propertyName, equalsToken, propertyValue));
                        if (this.#stream.peek().syntaxKind !== SyntaxKind.CommaToken) break;
                        properties.push(this.#match(SyntaxKind.CommaToken));
                    }
                    const braceCloseToken = this.#match(SyntaxKind.BraceCloseToken);
                    expression = new StructInitializerExpressionSyntax(expression, braceOpenToken, new SeparatedSyntaxList(properties), braceCloseToken);
                } continue;

                case SyntaxKind.ParenthesisOpenToken: {
                    const parenthesisOpenToken = this.#match(SyntaxKind.ParenthesisOpenToken);
                    const argumentList = new Array<SyntaxOrSeparator<ExpressionSyntax, SyntaxKind.CommaToken>>();
                    while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.ParenthesisCloseToken) {
                        argumentList.push(this.#parseExpression());
                        if (this.#stream.peek().syntaxKind !== SyntaxKind.CommaToken) break;
                        argumentList.push(this.#match(SyntaxKind.CommaToken));
                    }
                    const parenthesisCloseToken = this.#match(SyntaxKind.ParenthesisCloseToken);
                    expression = new CallExpressionSyntax(expression, parenthesisOpenToken, new SeparatedSyntaxList(argumentList), parenthesisCloseToken);
                } continue;

                case SyntaxKind.BracketOpenToken: {
                    const bracketOpenToken = this.#match(SyntaxKind.BracketOpenToken);
                    const index = this.#parseExpression();
                    const bracketCloseToken = this.#match(SyntaxKind.BracketCloseToken);
                    expression = new ElementAccessExpressionSyntax(expression, bracketOpenToken, index, bracketCloseToken);
                } continue;

                case SyntaxKind.DotToken: {
                    const dotToken = this.#match(SyntaxKind.DotToken);
                    const memberName = this.#parseName({ isSimpleOnly: true });
                    expression = new MemberAccessExpressionSyntax(expression, dotToken, memberName);
                } continue;

                case SyntaxKind.AsKeyword: {
                    const asKeyword = this.#match(SyntaxKind.AsKeyword);
                    const type = this.#parseType([
                        SyntaxKind.CommaToken,
                        SyntaxKind.ParenthesisCloseToken,
                        SyntaxKind.BracketCloseToken,
                        SyntaxKind.BraceCloseToken,
                        SyntaxKind.SemicolonToken
                    ]);
                    expression = new ConversionExpressionSyntax(expression, asKeyword, type);
                } continue;
            }

            const binaryPrecedence = SyntaxFacts.getBinaryOperatorPrecedence(this.#stream.peek().syntaxKind);
            if (binaryPrecedence > parentPrecedence) {
                const operatorToken = this.#stream.next();
                const right = this.#parseExpression(binaryPrecedence);
                expression = new BinaryExpressionSyntax(expression, operatorToken, right);
                continue;
            }

            break;
        }

        return expression;
    }

    #parseExpression_Module(): ModuleExpressionSyntax {
        const moduleKeyword = this.#match(SyntaxKind.ModuleKeyword);
        return new ModuleExpressionSyntax(moduleKeyword);
    }

    #parseExpression_Struct(): StructExpressionSyntax {
        const structKeyword = this.#match(SyntaxKind.StructKeyword);
        const braceOpenToken = this.#match(SyntaxKind.BraceOpenToken);
        const properties = new Array<LocalDeclarationSyntax>();
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.BraceCloseToken)
            properties.push(this.#parseLocalDeclaration());
        const braceCloseToken = this.#match(SyntaxKind.BraceCloseToken);
        return new StructExpressionSyntax(structKeyword, braceOpenToken, new SyntaxList(properties), braceCloseToken);
    }

    #parseExpression_Block(): BlockExpressionSyntax {
        const braceOpenToken = this.#match(SyntaxKind.BraceOpenToken);
        const items = new Array<BlockItemSyntax>();
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.BraceCloseToken) {
            let item: BlockItemSyntax;
            if (this.#isDeclarationAhead()) {
                item = this.#parseLocalDeclaration();
            } else {
                item = this.#parseExpression();
                if (this.#stream.peek().syntaxKind === SyntaxKind.SemicolonToken)
                    item = new StatementSyntax(item, this.#stream.next());
            }
            items.push(item);
        }
        const braceCloseToken = this.#match(SyntaxKind.BraceCloseToken);
        return new BlockExpressionSyntax(braceOpenToken, new SyntaxList(items), braceCloseToken);
    }

    #parseExpression_Group(): GroupExpressionSyntax {
        const parenthesisOpenToken = this.#match(SyntaxKind.ParenthesisOpenToken);
        const expression = this.#parseExpression();
        const parenthesisCloseToken = this.#match(SyntaxKind.ParenthesisCloseToken);
        return new GroupExpressionSyntax(parenthesisOpenToken, expression, parenthesisCloseToken);
    }

    #parseExpression_Lambda(): LambdaExpressionSyntax {
        const parenthesisOpenToken = this.#match(SyntaxKind.ParenthesisOpenToken);
        const parameters = new Array<SyntaxOrSeparator<SimpleNameSyntax, SyntaxKind.CommaToken>>();
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.ParenthesisCloseToken) {
            parameters.push(this.#parseName({ isSimpleOnly: true }));
            if (this.#stream.peek().syntaxKind !== SyntaxKind.CommaToken) break;
            parameters.push(this.#match(SyntaxKind.CommaToken));
        }
        const parenthesisCloseToken = this.#match(SyntaxKind.ParenthesisCloseToken);
        const equalsGreaterThanToken = this.#match(SyntaxKind.EqualsGreaterThanToken);
        const body = this.#parseExpression();
        return new LambdaExpressionSyntax(parenthesisOpenToken, new SeparatedSyntaxList(parameters), parenthesisCloseToken, equalsGreaterThanToken, body);
    }

    #parseExpression_ArrayInitializer(): ArrayInitializerExpressionSyntax {
        const bracketOpenToken = this.#match(SyntaxKind.BracketOpenToken);
        const elements = new Array<SyntaxOrSeparator<ExpressionSyntax, SyntaxKind.CommaToken>>();
        while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.BracketCloseToken) {
            elements.push(this.#parseExpression());
            if (this.#stream.peek().syntaxKind !== SyntaxKind.CommaToken) break;
            elements.push(this.#match(SyntaxKind.CommaToken));
        }
        const bracketCloseToken = this.#match(SyntaxKind.BracketCloseToken);
        return new ArrayInitializerExpressionSyntax(bracketOpenToken, new SeparatedSyntaxList(elements), bracketCloseToken);
    }

    #parseExpression_Literal(): LiteralExpressionSyntax {
        const syntaxKind = SyntaxFacts.getLiteralExpressionKind(this.#stream.peek().syntaxKind);
        if (syntaxKind === undefined)
            throw new Error("expected literal token");
        return new LiteralExpressionSyntax(syntaxKind, this.#stream.next());
    }

    #parseExpression_Name(): NameExpressionSyntax {
        const name = this.#parseName({ allowPrimiveTypes: true })
        return new NameExpressionSyntax(name);
    }

    #match<T extends SyntaxKind>(syntaxKind: T): SyntaxTokenOf<T> {
        const syntaxToken = this.#stream.next();
        if (syntaxToken.syntaxKind === syntaxKind) return syntaxToken as SyntaxTokenOf<T>;

        return this.#createSyntheticFrom(syntaxToken, syntaxKind);
    }

    #matchAny<const T extends readonly [SyntaxKind, SyntaxKind, ...SyntaxKind[]]>(...syntaxKinds: T): SyntaxTokenOf<T[number]> {
        const syntaxToken = this.#stream.next();
        for (const syntaxKind of syntaxKinds)
            if (syntaxToken.syntaxKind === syntaxKind)
                return syntaxToken;

        return this.#createSyntheticFrom(syntaxToken, syntaxKinds[0]);
    }

    #createSyntheticFrom<T extends SyntaxKind>(syntaxToken: SyntaxToken, expectedSyntaxKind: T): SyntaxTokenOf<T> {
        this.#diagnostics.push(Diagnostic.unexpectedToken(expectedSyntaxKind, syntaxToken));
        return new SyntaxToken(expectedSyntaxKind, syntaxToken.sourceSpan, [], [], undefined, true) as SyntaxTokenOf<T>;
    }

    #isLambdaAhead(): boolean {
        if (this.#stream.peek().syntaxKind !== SyntaxKind.ParenthesisOpenToken) return false;
        const checkpoint = this.#stream.checkpoint();
        try {
            do {
                this.#stream.skip();
            }
            while (!this.#stream.isAtEnd && this.#stream.peek().syntaxKind !== SyntaxKind.ParenthesisCloseToken)
            this.#stream.skip();
            return this.#stream.peek().syntaxKind === SyntaxKind.EqualsGreaterThanToken;
        }
        finally {
            checkpoint.reset();
        }
    }

    #isDeclarationAhead(): boolean {
        return this.#stream.peek().syntaxKind === SyntaxKind.IdentifierToken && this.#stream.peek(1).syntaxKind === SyntaxKind.ColonToken;
    }
}
