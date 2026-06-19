import { SyntaxKind } from "./syntax-kind.js";
import type { LiteralSyntaxKind } from "./syntax/expression-syntax.js";
import type { PredefinedTypeSyntaxKind } from "./syntax/type-syntax.js";

export const SyntaxFacts = Object.freeze({
    getText(syntaxKind: SyntaxKind): string | undefined {
        switch (syntaxKind) {
            case SyntaxKind.InvalidSyntax: return undefined;
            case SyntaxKind.EofToken: return undefined;
            case SyntaxKind.IdentifierToken: return undefined;

            case SyntaxKind.AmpersandToken: return "&";
            case SyntaxKind.AmpersandAmpersandToken: return "&&";
            case SyntaxKind.AmpersandEqualsToken: return "&=";
            case SyntaxKind.ExclamationToken: return "!";
            case SyntaxKind.ExclamationEqualsToken: return "!=";
            case SyntaxKind.BraceOpenToken: return "{";
            case SyntaxKind.BraceCloseToken: return "}";
            case SyntaxKind.BracketOpenToken: return "[";
            case SyntaxKind.BracketCloseToken: return "]";
            case SyntaxKind.BracketOpenBracketCloseToken: return "[]";
            case SyntaxKind.ColonToken: return ":";
            case SyntaxKind.CommaToken: return ",";
            case SyntaxKind.DotToken: return ".";
            case SyntaxKind.DotDotToken: return "..";
            case SyntaxKind.EqualsToken: return "=";
            case SyntaxKind.EqualsEqualsToken: return "==";
            case SyntaxKind.MinusGreaterThanToken: return "->";
            case SyntaxKind.GreaterThanToken: return ">";
            case SyntaxKind.GreaterThanEqualsToken: return ">=";
            case SyntaxKind.GreaterThanGreaterThanToken: return ">>";
            case SyntaxKind.GreaterThanGreaterThanEqualsToken: return ">>=";
            case SyntaxKind.CaretToken: return "^";
            case SyntaxKind.CaretEqualsToken: return "^=";
            case SyntaxKind.HookToken: return "?";
            case SyntaxKind.HookHookToken: return "??";
            case SyntaxKind.HookHookEqualsToken: return "??=";
            case SyntaxKind.LessThanToken: return "<";
            case SyntaxKind.LessThanEqualsToken: return "<=";
            case SyntaxKind.LessThanLessThanToken: return "<<";
            case SyntaxKind.LessThanLessThanEqualsToken: return "<<=";
            case SyntaxKind.MinusToken: return "-";
            case SyntaxKind.MinusEqualsToken: return "-=";
            case SyntaxKind.ParenthesisOpenToken: return "(";
            case SyntaxKind.ParenthesisCloseToken: return ")";
            case SyntaxKind.ParenthesisOpenParenthesisCloseToken: return "()";
            case SyntaxKind.PercentToken: return "%";
            case SyntaxKind.PercentEqualsToken: return "%=";
            case SyntaxKind.BarToken: return "|";
            case SyntaxKind.PipeEqualsToken: return "|=";
            case SyntaxKind.BarBarToken: return "||";
            case SyntaxKind.PlusToken: return "+";
            case SyntaxKind.PlusEqualsToken: return "+=";
            case SyntaxKind.SemicolonToken: return ";";
            case SyntaxKind.SlashToken: return "/";
            case SyntaxKind.SlashEqualsToken: return "/=";
            case SyntaxKind.AsteriskToken: return "*";
            case SyntaxKind.StarEqualsToken: return "*=";
            case SyntaxKind.AsteriskAsteriskToken: return "**";
            case SyntaxKind.StarStarEqualsToken: return "**=";
            case SyntaxKind.TildeToken: return "~";

            case SyntaxKind.I8LiteralToken: return undefined;
            case SyntaxKind.U8LiteralToken: return undefined;
            case SyntaxKind.I16LiteralToken: return undefined;
            case SyntaxKind.U16LiteralToken: return undefined;
            case SyntaxKind.I32LiteralToken: return undefined;
            case SyntaxKind.U32LiteralToken: return undefined;
            case SyntaxKind.I64LiteralToken: return undefined;
            case SyntaxKind.U64LiteralToken: return undefined;
            case SyntaxKind.F16LiteralToken: return undefined;
            case SyntaxKind.F32LiteralToken: return undefined;
            case SyntaxKind.F64LiteralToken: return undefined;
            case SyntaxKind.StrLiteralToken: return undefined;

            case SyntaxKind.AsKeyword: return "as";
            case SyntaxKind.IfKeyword: return "if";
            case SyntaxKind.ImplicitKeyword: return "implicit";
            case SyntaxKind.ElseKeyword: return "else";
            case SyntaxKind.ExplicitKeyword: return "explicit";
            case SyntaxKind.WhileKeyword: return "while";
            case SyntaxKind.ForKeyword: return "for";
            case SyntaxKind.ContinueKeyword: return "continue";
            case SyntaxKind.BreakKeyword: return "break";
            case SyntaxKind.ReturnKeyword: return "return";

            case SyntaxKind.AnyKeyword: return "any";
            case SyntaxKind.ErrKeyword: return "err";
            case SyntaxKind.UnknownKeyword: return "unknown";
            case SyntaxKind.NeverKeyword: return "never";
            case SyntaxKind.UnitKeyword: return "unit";
            case SyntaxKind.TypeKeyword: return "type";
            case SyntaxKind.StrKeyword: return "str";
            case SyntaxKind.BoolKeyword: return "bool";
            case SyntaxKind.I8Keyword: return "i8";
            case SyntaxKind.I16Keyword: return "i16";
            case SyntaxKind.I32Keyword: return "i32";
            case SyntaxKind.I64Keyword: return "i64";
            case SyntaxKind.IszKeyword: return "isz";
            case SyntaxKind.U8Keyword: return "u8";
            case SyntaxKind.U16Keyword: return "u16";
            case SyntaxKind.U32Keyword: return "u32";
            case SyntaxKind.U64Keyword: return "u64";
            case SyntaxKind.UszKeyword: return "usz";
            case SyntaxKind.F16Keyword: return "f16";
            case SyntaxKind.F32Keyword: return "f32";
            case SyntaxKind.F64Keyword: return "f64";

            case SyntaxKind.ModuleKeyword: return "module";
            case SyntaxKind.StructKeyword: return "struct";

            case SyntaxKind.TrueKeyword: return "true";
            case SyntaxKind.FalseKeyword: return "false";
            case SyntaxKind.NullKeyword: return "null";

            case SyntaxKind.ThisKeyword: return "this";

            case SyntaxKind.LineBreakTrivia: return undefined;
            case SyntaxKind.WhiteSpaceTrivia: return undefined;
            case SyntaxKind.SingleLineCommentTrivia: return undefined;
            case SyntaxKind.MultiLineCommentTrivia: return undefined;
            case SyntaxKind.InvalidTextTrivia: return undefined;

            case SyntaxKind.CompilationUnit: return undefined;

            case SyntaxKind.GlobalDeclaration: return undefined;
            case SyntaxKind.LocalDeclaration: return undefined;

            case SyntaxKind.MaybeType: return undefined;
            case SyntaxKind.NamedType: return undefined;
            case SyntaxKind.ErrorType: return undefined;
            case SyntaxKind.PointerType: return undefined;
            case SyntaxKind.ArrayType: return undefined;
            case SyntaxKind.LambdaType: return undefined;
            case SyntaxKind.UnionType: return undefined;

            case SyntaxKind.Parameter: return undefined;
            case SyntaxKind.Argument: return undefined;

            case SyntaxKind.SimpleName: return undefined;
            case SyntaxKind.QualifiedName: return undefined;

            case SyntaxKind.I8LiteralExpression: return undefined;
            case SyntaxKind.U8LiteralExpression: return undefined;
            case SyntaxKind.I16LiteralExpression: return undefined;
            case SyntaxKind.U16LiteralExpression: return undefined;
            case SyntaxKind.I32LiteralExpression: return undefined;
            case SyntaxKind.U32LiteralExpression: return undefined;
            case SyntaxKind.I64LiteralExpression: return undefined;
            case SyntaxKind.U64LiteralExpression: return undefined;
            case SyntaxKind.F16LiteralExpression: return undefined;
            case SyntaxKind.F32LiteralExpression: return undefined;
            case SyntaxKind.F64LiteralExpression: return undefined;
            case SyntaxKind.StrLiteralExpression: return undefined;
            case SyntaxKind.TrueLiteralExpression: return undefined;
            case SyntaxKind.FalseLiteralExpression: return undefined;
            case SyntaxKind.NullLiteralExpression: return undefined;

            case SyntaxKind.ModuleExpression: return undefined;
            case SyntaxKind.StructExpression: return undefined;

            case SyntaxKind.ExpressionStatement: return undefined;
            case SyntaxKind.BlockExpression: return undefined;
            case SyntaxKind.ArrayInitializerExpression: return undefined;
            case SyntaxKind.PropertyInitializerExpression: return undefined;

            case SyntaxKind.ElementAccessExpression: return undefined;
            case SyntaxKind.CallExpression: return undefined;
            case SyntaxKind.MemberAccessExpression: return undefined;
            case SyntaxKind.ConversionExpression: return undefined;

            case SyntaxKind.GroupExpression: return undefined;

            case SyntaxKind.UnaryPlusExpression: return undefined;
            case SyntaxKind.UnaryMinusExpression: return undefined;
            case SyntaxKind.OnesComplementExpression: return undefined;
            case SyntaxKind.NotExpression: return undefined;

            case SyntaxKind.AddExpression: return undefined;
            case SyntaxKind.SubtractExpression: return undefined;
            case SyntaxKind.MultiplyExpression: return undefined;
            case SyntaxKind.DivideExpression: return undefined;
            case SyntaxKind.ModuloExpression: return undefined;
            case SyntaxKind.PowerExpression: return undefined;
            case SyntaxKind.LeftShiftExpression: return undefined;
            case SyntaxKind.RightShiftExpression: return undefined;
            case SyntaxKind.LogicalOrExpression: return undefined;
            case SyntaxKind.LogicalAndExpression: return undefined;
            case SyntaxKind.BitwiseOrExpression: return undefined;
            case SyntaxKind.BitwiseAndExpression: return undefined;
            case SyntaxKind.ExclusiveOrExpression: return undefined;
            case SyntaxKind.EqualsExpression: return undefined;
            case SyntaxKind.NotEqualsExpression: return undefined;
            case SyntaxKind.LessThanExpression: return undefined;
            case SyntaxKind.LessThanOrEqualExpression: return undefined;
            case SyntaxKind.GreaterThanExpression: return undefined;
            case SyntaxKind.GreaterThanOrEqualExpression: return undefined;
            case SyntaxKind.CoalesceExpression: return undefined;

            case SyntaxKind.AssignmentExpression: return undefined;
            case SyntaxKind.InitValueExpression: return undefined;

            case SyntaxKind.IfExpression: return undefined;
            case SyntaxKind.ElseClauseExpression: return undefined;
            case SyntaxKind.WhileExpression: return undefined;

            case SyntaxKind.ContinueExpression: return undefined;
            case SyntaxKind.BreakExpression: return undefined;
            case SyntaxKind.ReturnExpression: return undefined;

            default: return undefined;
        }
    },

    getKeywordKind(syntaxText: string): SyntaxKind {
        switch (syntaxText) {
            case "as": return SyntaxKind.AsKeyword;
            case "if": return SyntaxKind.IfKeyword;
            case "implicit": return SyntaxKind.ImplicitKeyword;
            case "else": return SyntaxKind.ElseKeyword;
            case "explicit": return SyntaxKind.ExplicitKeyword;
            case "while": return SyntaxKind.WhileKeyword;
            case "for": return SyntaxKind.ForKeyword;
            case "continue": return SyntaxKind.ContinueKeyword;
            case "break": return SyntaxKind.BreakKeyword;
            case "return": return SyntaxKind.ReturnKeyword;

            case "any": return SyntaxKind.AnyKeyword;
            case "err": return SyntaxKind.ErrKeyword;
            case "unknown": return SyntaxKind.UnknownKeyword;
            case "never": return SyntaxKind.NeverKeyword;
            case "unit": return SyntaxKind.UnitKeyword;
            case "type": return SyntaxKind.TypeKeyword;
            case "str": return SyntaxKind.StrKeyword;
            case "bool": return SyntaxKind.BoolKeyword;
            case "i8": return SyntaxKind.I8Keyword;
            case "i16": return SyntaxKind.I16Keyword;
            case "i32": return SyntaxKind.I32Keyword;
            case "i64": return SyntaxKind.I64Keyword;
            case "isz": return SyntaxKind.IszKeyword;
            case "u8": return SyntaxKind.U8Keyword;
            case "u16": return SyntaxKind.U16Keyword;
            case "u32": return SyntaxKind.U32Keyword;
            case "u64": return SyntaxKind.U64Keyword;
            case "usz": return SyntaxKind.UszKeyword;
            case "f16": return SyntaxKind.F16Keyword;
            case "f32": return SyntaxKind.F32Keyword;
            case "f64": return SyntaxKind.F64Keyword;

            case "module": return SyntaxKind.ModuleKeyword;
            case "struct": return SyntaxKind.StructKeyword;

            case "true": return SyntaxKind.TrueKeyword;
            case "false": return SyntaxKind.FalseKeyword;
            case "null": return SyntaxKind.NullKeyword;

            case "this": return SyntaxKind.ThisKeyword;

            default: return SyntaxKind.IdentifierToken;
        };
    },

    getPredefinedTypeKind(syntaxKind: SyntaxKind): PredefinedTypeSyntaxKind | undefined {
        switch (syntaxKind) {
            case SyntaxKind.AnyKeyword: return SyntaxKind.AnyType;
            case SyntaxKind.ErrKeyword: return SyntaxKind.ErrType;
            case SyntaxKind.UnknownKeyword: return SyntaxKind.UnknownType;
            case SyntaxKind.NeverKeyword: return SyntaxKind.NeverType;
            case SyntaxKind.UnitKeyword: return SyntaxKind.UnitType;
            case SyntaxKind.TypeKeyword: return SyntaxKind.TypeType;
            case SyntaxKind.StrKeyword: return SyntaxKind.StrType;
            case SyntaxKind.BoolKeyword: return SyntaxKind.BoolType;
            case SyntaxKind.I8Keyword: return SyntaxKind.I8Type;
            case SyntaxKind.I16Keyword: return SyntaxKind.I16Type;
            case SyntaxKind.I32Keyword: return SyntaxKind.I32Type;
            case SyntaxKind.I64Keyword: return SyntaxKind.I64Type;
            case SyntaxKind.IszKeyword: return SyntaxKind.IszType;
            case SyntaxKind.U8Keyword: return SyntaxKind.U8Type;
            case SyntaxKind.U16Keyword: return SyntaxKind.U16Type;
            case SyntaxKind.U32Keyword: return SyntaxKind.U32Type;
            case SyntaxKind.U64Keyword: return SyntaxKind.U64Type;
            case SyntaxKind.UszKeyword: return SyntaxKind.UszType;
            case SyntaxKind.F16Keyword: return SyntaxKind.F16Type;
            case SyntaxKind.F32Keyword: return SyntaxKind.F32Type;
            case SyntaxKind.F64Keyword: return SyntaxKind.F64Type;
            default: return undefined;
        }
    },

    getLiteralExpressionKind(syntaxKind: SyntaxKind): LiteralSyntaxKind | undefined {
        switch (syntaxKind) {
            case SyntaxKind.I8LiteralToken: return SyntaxKind.I8LiteralExpression;
            case SyntaxKind.U8LiteralToken: return SyntaxKind.U8LiteralExpression;
            case SyntaxKind.I16LiteralToken: return SyntaxKind.I16LiteralExpression;
            case SyntaxKind.U16LiteralToken: return SyntaxKind.U16LiteralExpression;
            case SyntaxKind.I32LiteralToken: return SyntaxKind.I32LiteralExpression;
            case SyntaxKind.U32LiteralToken: return SyntaxKind.U32LiteralExpression;
            case SyntaxKind.I64LiteralToken: return SyntaxKind.I64LiteralExpression;
            case SyntaxKind.U64LiteralToken: return SyntaxKind.U64LiteralExpression;
            case SyntaxKind.F16LiteralToken: return SyntaxKind.F16LiteralExpression;
            case SyntaxKind.F32LiteralToken: return SyntaxKind.F32LiteralExpression;
            case SyntaxKind.F64LiteralToken: return SyntaxKind.F64LiteralExpression;
            case SyntaxKind.StrLiteralToken: return SyntaxKind.StrLiteralExpression;
            case SyntaxKind.TrueKeyword: return SyntaxKind.TrueLiteralExpression;
            case SyntaxKind.FalseKeyword: return SyntaxKind.FalseLiteralExpression;
            case SyntaxKind.NullKeyword: return SyntaxKind.NullLiteralExpression;
            default: return undefined;
        }
    },

    getUnaryOperatorPrecedence(syntaxKind: SyntaxKind) {
        switch (syntaxKind) {
            case SyntaxKind.ExclamationToken: return 8;
            case SyntaxKind.MinusToken: return 8;
            case SyntaxKind.PlusToken: return 8;
            case SyntaxKind.TildeToken: return 8;
            default: return 0;
        }
    },

    getUnaryOperatorExpression(operatorKind: SyntaxKind) {
        switch (operatorKind) {
            case SyntaxKind.ExclamationToken: return SyntaxKind.NotExpression;
            case SyntaxKind.MinusToken: return SyntaxKind.UnaryMinusExpression;
            case SyntaxKind.PlusToken: return SyntaxKind.UnaryPlusExpression;
            case SyntaxKind.TildeToken: return SyntaxKind.OnesComplementExpression;
            default: throw new Error(`Unexpected SyntaxKind`);
        }
    },

    getBinaryOperatorPrecedence(syntaxKind: SyntaxKind) {
        switch (syntaxKind) {
            case SyntaxKind.AsteriskAsteriskToken: return 7;
            case SyntaxKind.PercentToken: return 6;
            case SyntaxKind.AsteriskToken: return 6;
            case SyntaxKind.SlashToken: return 6;
            case SyntaxKind.PlusToken: return 5;
            case SyntaxKind.MinusToken: return 5;
            case SyntaxKind.LessThanLessThanToken: return 4;
            case SyntaxKind.GreaterThanGreaterThanToken: return 4;
            case SyntaxKind.EqualsEqualsToken: return 3;
            case SyntaxKind.ExclamationEqualsToken: return 3;
            case SyntaxKind.LessThanToken: return 3;
            case SyntaxKind.LessThanEqualsToken: return 3;
            case SyntaxKind.GreaterThanToken: return 3;
            case SyntaxKind.GreaterThanEqualsToken: return 3;
            case SyntaxKind.AmpersandToken: return 2;
            case SyntaxKind.AmpersandAmpersandToken: return 2;
            case SyntaxKind.BarToken: return 1;
            case SyntaxKind.BarBarToken: return 1;
            case SyntaxKind.CaretToken: return 1;
            case SyntaxKind.HookHookToken: return 1;
            default: return 0;
        }
    },

    getBinaryOperatorExpression(operatorKind: SyntaxKind) {
        switch (operatorKind) {
            case SyntaxKind.AsteriskAsteriskToken: return SyntaxKind.PowerExpression;
            case SyntaxKind.PercentToken: return SyntaxKind.ModuloExpression;
            case SyntaxKind.AsteriskToken: return SyntaxKind.MultiplyExpression;
            case SyntaxKind.SlashToken: return SyntaxKind.DivideExpression;
            case SyntaxKind.PlusToken: return SyntaxKind.AddExpression;
            case SyntaxKind.MinusToken: return SyntaxKind.SubtractExpression;
            case SyntaxKind.LessThanLessThanToken: return SyntaxKind.LeftShiftExpression;
            case SyntaxKind.GreaterThanGreaterThanToken: return SyntaxKind.RightShiftExpression;
            case SyntaxKind.EqualsEqualsToken: return SyntaxKind.EqualsExpression;
            case SyntaxKind.ExclamationEqualsToken: return SyntaxKind.NotEqualsExpression;
            case SyntaxKind.LessThanToken: return SyntaxKind.LessThanExpression;
            case SyntaxKind.LessThanEqualsToken: return SyntaxKind.LessThanOrEqualExpression;
            case SyntaxKind.GreaterThanToken: return SyntaxKind.GreaterThanExpression;
            case SyntaxKind.GreaterThanEqualsToken: return SyntaxKind.GreaterThanOrEqualExpression;
            case SyntaxKind.AmpersandToken: return SyntaxKind.BitwiseAndExpression;
            case SyntaxKind.AmpersandAmpersandToken: return SyntaxKind.LogicalAndExpression;
            case SyntaxKind.BarToken: return SyntaxKind.BitwiseOrExpression;
            case SyntaxKind.BarBarToken: return SyntaxKind.LogicalOrExpression;
            case SyntaxKind.CaretToken: return SyntaxKind.ExclusiveOrExpression;
            case SyntaxKind.HookHookToken: return SyntaxKind.CoalesceExpression;
            default: throw new Error(`Unexpected SyntaxKind`);
        }
    }
});
