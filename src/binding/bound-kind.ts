export enum BoundKind {
    // Error / sentinel
    Unbound,

    // Declarations
    Declaration,

    // Locations/ l-values
    VariableLocation,
    ElementLocation,
    MemberLocation,

    // Terminated expression (value discarded).
    ExpressionStatement,

    // Basic expressions
    LiteralExpression,
    LambdaExpression,
    BlockExpression,
    ArrayExpression,
    InvocationExpression,
    ObjectInitializerExpression,
    PropertyInitializerExpression,
    TypeExpression,
    ModuleExpression,

    // Operators
    AssignmentExpression,
    UnaryExpression,
    BinaryExpression,

    // Control-flow expressions
    IfElseExpression,
    WhileExpression,
    BreakExpression,
    ContinueExpression,
    ReturnExpression,
    GotoExpression,
    GotoIfExpression,

    // Lowering / special expressions
    NopExpression,
    NeverExpression,
}
