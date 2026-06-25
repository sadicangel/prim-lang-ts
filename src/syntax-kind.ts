export enum SyntaxKind {
    // SyntaxTokens
    InvalidSyntaxToken,
    EofToken,
    IdentifierToken,

    I8LiteralToken,
    U8LiteralToken,
    I16LiteralToken,
    U16LiteralToken,
    I32LiteralToken,
    U32LiteralToken,
    I64LiteralToken,
    U64LiteralToken,
    F16LiteralToken,
    F32LiteralToken,
    F64LiteralToken,
    StrLiteralToken,

    AmpersandToken,
    AmpersandAmpersandToken,
    AmpersandEqualsToken,
    ExclamationToken,
    ExclamationEqualsToken,
    BraceOpenToken,
    BraceCloseToken,
    BracketOpenToken,
    BracketCloseToken,
    BracketOpenBracketCloseToken,
    ColonToken,
    CommaToken,
    DotToken,
    DotDotToken,
    EqualsToken,
    EqualsEqualsToken,
    GreaterThanToken,
    GreaterThanEqualsToken,
    GreaterThanGreaterThanToken,
    GreaterThanGreaterThanEqualsToken,
    CaretToken,
    CaretEqualsToken,
    HookToken,
    HookHookToken,
    HookHookEqualsToken,
    LessThanToken,
    LessThanEqualsToken,
    LessThanLessThanToken,
    LessThanLessThanEqualsToken,
    MinusToken,
    MinusEqualsToken,
    ParenthesisOpenToken,
    ParenthesisCloseToken,
    ParenthesisOpenParenthesisCloseToken,
    PercentToken,
    PercentEqualsToken,
    BarToken,
    PipeEqualsToken,
    BarBarToken,
    PlusToken,
    PlusEqualsToken,
    SemicolonToken,
    SlashToken,
    SlashEqualsToken,
    AsteriskToken,
    StarEqualsToken,
    AsteriskAsteriskToken,
    StarStarEqualsToken,
    TildeToken,

    EqualsGreaterThanToken,
    MinusGreaterThanToken,

    AsKeyword,
    IfKeyword,
    ImplicitKeyword,
    ElseKeyword,
    ExplicitKeyword,
    WhileKeyword,
    ForKeyword,
    ContinueKeyword,
    BreakKeyword,
    ReturnKeyword,

    AnyKeyword,
    ErrKeyword,
    UnknownKeyword,
    NeverKeyword,
    UnitKeyword,
    TypeKeyword,
    StrKeyword,
    BoolKeyword,
    I8Keyword,
    I16Keyword,
    I32Keyword,
    I64Keyword,
    IszKeyword,
    U8Keyword,
    U16Keyword,
    U32Keyword,
    U64Keyword,
    UszKeyword,
    F16Keyword,
    F32Keyword,
    F64Keyword,

    ModuleKeyword,
    StructKeyword,

    TrueKeyword,
    FalseKeyword,
    NullKeyword,

    ThisKeyword,

    LineBreakTrivia,
    WhiteSpaceTrivia,
    SingleLineCommentTrivia,
    MultiLineCommentTrivia,
    InvalidTextTrivia,

    // Types
    AnyType,
    ErrType,
    UnknownType,
    NeverType,
    UnitType,
    TypeType,
    StrType,
    BoolType,
    I8Type,
    I16Type,
    I32Type,
    I64Type,
    IszType,
    U8Type,
    U16Type,
    U32Type,
    U64Type,
    UszType,
    F16Type,
    F32Type,
    F64Type,
    ErrorType,
    ArrayType,
    LambdaType,
    NamedType,
    MaybeType,
    PointerType,
    UnionType,

    // Other

    Parameter,
    Argument,
    ElseClause,

    CompilationUnit,

    SimpleName,
    QualifiedName,

    GlobalDeclaration,
    LocalDeclaration,

    ExpressionStatement,

    // Expressions

    I8LiteralExpression,
    U8LiteralExpression,
    I16LiteralExpression,
    U16LiteralExpression,
    I32LiteralExpression,
    U32LiteralExpression,
    I64LiteralExpression,
    U64LiteralExpression,
    F16LiteralExpression,
    F32LiteralExpression,
    F64LiteralExpression,
    StrLiteralExpression,
    TrueLiteralExpression,
    FalseLiteralExpression,
    NullLiteralExpression,

    ModuleExpression,
    StructExpression,

    NameExpression,

    BlockExpression,

    ArrayInitializerExpression,
    ObjectInitializerExpression,
    PropertyInitializerExpression,

    ElementAccessExpression,
    InvocationExpression,
    MemberAccessExpression,
    ConversionExpression,

    GroupExpression,
    LambdaExpression,

    UnaryPlusExpression,
    UnaryMinusExpression,
    OnesComplementExpression,
    NotExpression,

    AddExpression,
    SubtractExpression,
    MultiplyExpression,
    DivideExpression,
    ModuloExpression,
    PowerExpression,
    LeftShiftExpression,
    RightShiftExpression,
    LogicalOrExpression,
    LogicalAndExpression,
    BitwiseOrExpression,
    BitwiseAndExpression,
    ExclusiveOrExpression,
    EqualsExpression,
    NotEqualsExpression,
    LessThanExpression,
    LessThanOrEqualExpression,
    GreaterThanExpression,
    GreaterThanOrEqualExpression,
    CoalesceExpression,

    AssignmentExpression,

    InitValueExpression,

    IfElseExpression,
    WhileExpression,

    ContinueExpression,
    BreakExpression,
    ReturnExpression,
}

export type SyntaxTokenKind = SyntaxKind.InvalidSyntaxToken
    | SyntaxKind.EofToken
    | SyntaxKind.IdentifierToken
    | SyntaxKind.I8LiteralToken
    | SyntaxKind.U8LiteralToken
    | SyntaxKind.I16LiteralToken
    | SyntaxKind.U16LiteralToken
    | SyntaxKind.I32LiteralToken
    | SyntaxKind.U32LiteralToken
    | SyntaxKind.I64LiteralToken
    | SyntaxKind.U64LiteralToken
    | SyntaxKind.F16LiteralToken
    | SyntaxKind.F32LiteralToken
    | SyntaxKind.F64LiteralToken
    | SyntaxKind.StrLiteralToken
    | SyntaxKind.AmpersandToken
    | SyntaxKind.AmpersandAmpersandToken
    | SyntaxKind.AmpersandEqualsToken
    | SyntaxKind.ExclamationToken
    | SyntaxKind.ExclamationEqualsToken
    | SyntaxKind.BraceOpenToken
    | SyntaxKind.BraceCloseToken
    | SyntaxKind.BracketOpenToken
    | SyntaxKind.BracketCloseToken
    | SyntaxKind.BracketOpenBracketCloseToken
    | SyntaxKind.ColonToken
    | SyntaxKind.CommaToken
    | SyntaxKind.DotToken
    | SyntaxKind.DotDotToken
    | SyntaxKind.EqualsToken
    | SyntaxKind.EqualsEqualsToken
    | SyntaxKind.GreaterThanToken
    | SyntaxKind.GreaterThanEqualsToken
    | SyntaxKind.GreaterThanGreaterThanToken
    | SyntaxKind.GreaterThanGreaterThanEqualsToken
    | SyntaxKind.CaretToken
    | SyntaxKind.CaretEqualsToken
    | SyntaxKind.HookToken
    | SyntaxKind.HookHookToken
    | SyntaxKind.HookHookEqualsToken
    | SyntaxKind.LessThanToken
    | SyntaxKind.LessThanEqualsToken
    | SyntaxKind.LessThanLessThanToken
    | SyntaxKind.LessThanLessThanEqualsToken
    | SyntaxKind.MinusToken
    | SyntaxKind.MinusEqualsToken
    | SyntaxKind.ParenthesisOpenToken
    | SyntaxKind.ParenthesisCloseToken
    | SyntaxKind.ParenthesisOpenParenthesisCloseToken
    | SyntaxKind.PercentToken
    | SyntaxKind.PercentEqualsToken
    | SyntaxKind.BarToken
    | SyntaxKind.PipeEqualsToken
    | SyntaxKind.BarBarToken
    | SyntaxKind.PlusToken
    | SyntaxKind.PlusEqualsToken
    | SyntaxKind.SemicolonToken
    | SyntaxKind.SlashToken
    | SyntaxKind.SlashEqualsToken
    | SyntaxKind.AsteriskToken
    | SyntaxKind.StarEqualsToken
    | SyntaxKind.AsteriskAsteriskToken
    | SyntaxKind.StarStarEqualsToken
    | SyntaxKind.TildeToken
    | SyntaxKind.EqualsGreaterThanToken
    | SyntaxKind.MinusGreaterThanToken;

export type LiteralSyntaxKind = SyntaxKind.I8LiteralExpression
    | SyntaxKind.U8LiteralExpression
    | SyntaxKind.I16LiteralExpression
    | SyntaxKind.U16LiteralExpression
    | SyntaxKind.I32LiteralExpression
    | SyntaxKind.U32LiteralExpression
    | SyntaxKind.I64LiteralExpression
    | SyntaxKind.U64LiteralExpression
    | SyntaxKind.F16LiteralExpression
    | SyntaxKind.F32LiteralExpression
    | SyntaxKind.F64LiteralExpression
    | SyntaxKind.StrLiteralExpression
    | SyntaxKind.TrueLiteralExpression
    | SyntaxKind.FalseLiteralExpression
    | SyntaxKind.NullLiteralExpression;

export type KeywordSyntaxKind = SyntaxKind.AsKeyword
    | SyntaxKind.IfKeyword
    | SyntaxKind.ImplicitKeyword
    | SyntaxKind.ElseKeyword
    | SyntaxKind.ExplicitKeyword
    | SyntaxKind.WhileKeyword
    | SyntaxKind.ForKeyword
    | SyntaxKind.ContinueKeyword
    | SyntaxKind.BreakKeyword
    | SyntaxKind.ReturnKeyword
    | SyntaxKind.AnyKeyword
    | SyntaxKind.ErrKeyword
    | SyntaxKind.UnknownKeyword
    | SyntaxKind.NeverKeyword
    | SyntaxKind.UnitKeyword
    | SyntaxKind.TypeKeyword
    | SyntaxKind.StrKeyword
    | SyntaxKind.BoolKeyword
    | SyntaxKind.I8Keyword
    | SyntaxKind.I16Keyword
    | SyntaxKind.I32Keyword
    | SyntaxKind.I64Keyword
    | SyntaxKind.IszKeyword
    | SyntaxKind.U8Keyword
    | SyntaxKind.U16Keyword
    | SyntaxKind.U32Keyword
    | SyntaxKind.U64Keyword
    | SyntaxKind.UszKeyword
    | SyntaxKind.F16Keyword
    | SyntaxKind.F32Keyword
    | SyntaxKind.F64Keyword
    | SyntaxKind.ModuleKeyword
    | SyntaxKind.StructKeyword
    | SyntaxKind.TrueKeyword
    | SyntaxKind.FalseKeyword
    | SyntaxKind.NullKeyword
    | SyntaxKind.ThisKeyword;

export type TriviaSyntaxKind = SyntaxKind.LineBreakTrivia
    | SyntaxKind.WhiteSpaceTrivia
    | SyntaxKind.SingleLineCommentTrivia
    | SyntaxKind.MultiLineCommentTrivia
    | SyntaxKind.InvalidTextTrivia

export type TypeSyntaxKind = SyntaxKind.AnyType
    | SyntaxKind.ErrType
    | SyntaxKind.UnknownType
    | SyntaxKind.NeverType
    | SyntaxKind.UnitType
    | SyntaxKind.TypeType
    | SyntaxKind.StrType
    | SyntaxKind.BoolType
    | SyntaxKind.I8Type
    | SyntaxKind.I16Type
    | SyntaxKind.I32Type
    | SyntaxKind.I64Type
    | SyntaxKind.IszType
    | SyntaxKind.U8Type
    | SyntaxKind.U16Type
    | SyntaxKind.U32Type
    | SyntaxKind.U64Type
    | SyntaxKind.UszType
    | SyntaxKind.F16Type
    | SyntaxKind.F32Type
    | SyntaxKind.F64Type
    | SyntaxKind.ArrayType
    | SyntaxKind.LambdaType
    | SyntaxKind.NamedType
    | SyntaxKind.MaybeType
    | SyntaxKind.PointerType
    | SyntaxKind.UnionType

export type ExpressionSyntaxKind = SyntaxKind.I8LiteralExpression
    | SyntaxKind.U8LiteralExpression
    | SyntaxKind.I16LiteralExpression
    | SyntaxKind.U16LiteralExpression
    | SyntaxKind.I32LiteralExpression
    | SyntaxKind.U32LiteralExpression
    | SyntaxKind.I64LiteralExpression
    | SyntaxKind.U64LiteralExpression
    | SyntaxKind.F16LiteralExpression
    | SyntaxKind.F32LiteralExpression
    | SyntaxKind.F64LiteralExpression
    | SyntaxKind.StrLiteralExpression
    | SyntaxKind.TrueLiteralExpression
    | SyntaxKind.FalseLiteralExpression
    | SyntaxKind.NullLiteralExpression
    | SyntaxKind.ModuleExpression
    | SyntaxKind.StructExpression
    | SyntaxKind.NameExpression
    | SyntaxKind.BlockExpression
    | SyntaxKind.ArrayInitializerExpression
    | SyntaxKind.ObjectInitializerExpression
    | SyntaxKind.PropertyInitializerExpression
    | SyntaxKind.ElementAccessExpression
    | SyntaxKind.InvocationExpression
    | SyntaxKind.MemberAccessExpression
    | SyntaxKind.ConversionExpression
    | SyntaxKind.GroupExpression
    | SyntaxKind.LambdaExpression
    | SyntaxKind.UnaryPlusExpression
    | SyntaxKind.UnaryMinusExpression
    | SyntaxKind.OnesComplementExpression
    | SyntaxKind.NotExpression
    | SyntaxKind.AddExpression
    | SyntaxKind.SubtractExpression
    | SyntaxKind.MultiplyExpression
    | SyntaxKind.DivideExpression
    | SyntaxKind.ModuloExpression
    | SyntaxKind.PowerExpression
    | SyntaxKind.LeftShiftExpression
    | SyntaxKind.RightShiftExpression
    | SyntaxKind.LogicalOrExpression
    | SyntaxKind.LogicalAndExpression
    | SyntaxKind.BitwiseOrExpression
    | SyntaxKind.BitwiseAndExpression
    | SyntaxKind.ExclusiveOrExpression
    | SyntaxKind.EqualsExpression
    | SyntaxKind.NotEqualsExpression
    | SyntaxKind.LessThanExpression
    | SyntaxKind.LessThanOrEqualExpression
    | SyntaxKind.GreaterThanExpression
    | SyntaxKind.GreaterThanOrEqualExpression
    | SyntaxKind.CoalesceExpression
    | SyntaxKind.AssignmentExpression
    | SyntaxKind.InitValueExpression
    | SyntaxKind.IfElseExpression
    | SyntaxKind.ElseClause
    | SyntaxKind.WhileExpression
    | SyntaxKind.ContinueExpression
    | SyntaxKind.BreakExpression
    | SyntaxKind.ReturnExpression
