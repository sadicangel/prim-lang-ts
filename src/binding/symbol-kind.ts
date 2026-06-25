export enum SymbolKind {
    Module,
    Property,
    Indexer,
    Operator,
    Conversion,
    Variable,
    Label,

    ArrayType,
    LambdaType,
    PointerType,
    StructType,
    UnionType,
}

export type UnaryOperatorId = "UnaryPlus" | "UnaryMinus" | "OnesComplement" | "Not";
export type BinaryOperatorId = "Add" | "Subtract" | "Multiply" | "Divide" | "Modulo" | "Power" | "LeftShift" | "RightShift" | "LogicalOr" | "LogicalAnd" | "BitwiseOr" | "BitwiseAnd" | "ExclusiveOr" | "Equals" | "NotEquals" | "LessThan" | "LessThanOrEqual" | "GreaterThan" | "GreaterThanOrEqual" | "Coalesce"
export type IndexOperatorId = "Index";