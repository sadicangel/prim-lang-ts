import type { SyntaxKind } from "./syntax-kind.js";
import type { SyntaxToken } from "./syntax-token.js";
import type { SyntaxTrivia } from "./syntax-trivia.js";
import type { CompilationUnitSyntax } from "./syntax/compilation-unit-syntax.js";
import type { GlobalDeclarationSyntax, LocalDeclarationSyntax } from "./syntax/declaration-syntax.js";
import type { BlockItemSyntax, ElseClauseExpressionSyntax, ExpressionSyntax, PropertyInitializerExpression } from "./syntax/expression-syntax.js";
import type { NameSyntax } from "./syntax/name-syntax.js";
import type { TypeSyntax } from "./syntax/type-syntax.js";

export type ISyntaxNode = {
    readonly syntaxKind: SyntaxKind;
    children(): Iterator<SyntaxNode>;
};

export type SyntaxNode = SyntaxToken
    | SyntaxTrivia
    | CompilationUnitSyntax
    | NameSyntax
    | TypeSyntax
    | GlobalDeclarationSyntax
    | LocalDeclarationSyntax
    | ExpressionSyntax
    | ElseClauseExpressionSyntax
    | BlockItemSyntax
    | PropertyInitializerExpression;
