import type { Diagnostic } from "../diagnostics/diagnostic.js";
import { PredefinedTypeNames } from "../predefined-type-names.js";
import { SyntaxKind } from "../syntax-kind.js";
import type { SyntaxNode } from "../syntax-node.js";
import { GlobalDeclarationSyntax, isReadOnly, isStatic, type LocalDeclarationSyntax } from "../syntax/declaration-syntax.js";
import { AssignmentExpression as AssignmentExpressionSyntax, BinaryExpressionSyntax, InvocationExpressionSyntax, ConversionExpressionSyntax, ElementAccessExpressionSyntax, GroupExpressionSyntax, IfElseExpressionSyntax, LambdaExpressionSyntax, MemberAccessExpressionSyntax, UnaryExpressionSyntax, WhileExpressionSyntax, type BinaryExpressionSyntaxKind, type BreakExpressionSyntax, type ContinueExpressionSyntax, type ExpressionSyntax, type ReturnExpressionSyntax, type UnaryExpressionSyntaxKind, PropertyInitializerExpression, ObjectInitializerExpressionSyntax, ArrayInitializerExpressionSyntax, BlockExpressionSyntax, NameExpressionSyntax, StructExpressionSyntax, ModuleExpressionSyntax, LiteralExpressionSyntax } from "../syntax/expression-syntax.js";
import type { ExpressionStatementSyntax } from "../syntax/statement-syntax.js";
import { LambdaTypeSyntax, MaybeTypeSyntax, NamedTypeSyntax, PointerTypeSyntax, UnionTypeSyntax, type ArrayTypeSyntax, type TypeSyntax } from "../syntax/type-syntax.js";
import { Range } from "../text/range.js";
import { SourceSpan } from "../text/source-span.js";
import { BoundAssignmentExpression, BoundBinaryExpression, BoundBreakExpression, BoundContinueExpression, BoundElementLocation, BoundIfElseExpression, BoundLambdaExpression, BoundLiteralExpression, BoundNeverExpression, BoundMemberLocation, BoundReturnExpression, BoundUnaryExpression, BoundVariableLocation, BoundWhileExpression, type BoundExpression, type BoundNode, type BoundStatement, BoundInvocationExpression, type BoundLocation, BoundObjectInitializerExpression, BoundTypeExpression, BoundPropertyInitializerExpression as BoundPropertyInitializerExpression, BoundArrayExpression as BoundArrayExpression, BoundBlockExpression, isExpression, BoundModuleExpression, BoundExpressionStatement, BoundDeclaration } from "./bound-node.js";
import type { BinaryOperatorId, UnaryOperatorId } from "./symbol-kind.js";
import { ArrayTypeSymbol, IndexerSymbol, LambdaTypeSymbol, makeOperatorName, ModuleSymbol, OperatorSymbol, PointerTypeSymbol, PropertySymbol, StructTypeSymbol, TypeSymbol, UnionTypeSymbol, VariableSymbol, type MemberSymbol, type Symbol } from "./symbol.js";

export class BindingContext {
    readonly diagnostics = new Array<Diagnostic>();
    readonly declarations = new Map<Symbol, BoundDeclaration>();
}

export abstract class Binder {
    constructor(
        readonly parent: Binder | undefined,
        readonly context: BindingContext = parent?.context ?? new BindingContext()) { }

    abstract readonly module: ModuleSymbol;
    abstract declare(symbol: Symbol): boolean;
    abstract lookup(name: string): Symbol | undefined

    get diagnostics(): readonly Diagnostic[] {
        return this.context.diagnostics;
    }

    protected report(diagnostic: Diagnostic): void {
        this.context.diagnostics.push(diagnostic);
    }

    bind(syntax: ExpressionSyntax): BoundExpression
    bind(syntax: SyntaxNode): BoundNode
    bind(syntax: SyntaxNode): BoundNode {
        switch (syntax.syntaxKind) {
            case SyntaxKind.GlobalDeclaration: return this.bindDeclaration(syntax);
            case SyntaxKind.LocalDeclaration: return this.bindDeclaration(syntax);

            case SyntaxKind.ExpressionStatement: return this.bindExpressionStatement(syntax);

            case SyntaxKind.I8LiteralExpression:
            case SyntaxKind.U8LiteralExpression:
            case SyntaxKind.I16LiteralExpression:
            case SyntaxKind.U16LiteralExpression:
            case SyntaxKind.I32LiteralExpression:
            case SyntaxKind.U32LiteralExpression:
            case SyntaxKind.I64LiteralExpression:
            case SyntaxKind.U64LiteralExpression:
            case SyntaxKind.F16LiteralExpression:
            case SyntaxKind.F32LiteralExpression:
            case SyntaxKind.F64LiteralExpression:
            case SyntaxKind.StrLiteralExpression:
            case SyntaxKind.TrueLiteralExpression:
            case SyntaxKind.FalseLiteralExpression:
            case SyntaxKind.NullLiteralExpression: return this.bindLiteralExpression(syntax);

            case SyntaxKind.ModuleExpression: return this.bindModuleExpression(syntax);
            case SyntaxKind.StructExpression: return this.bindStructExpression(syntax);

            case SyntaxKind.NameExpression: return this.bindNameExpression(syntax);

            case SyntaxKind.BlockExpression: return this.bindBlockExpression(syntax);

            case SyntaxKind.ArrayInitializerExpression: return this.bindArrayInitializerExpression(syntax);
            case SyntaxKind.ObjectInitializerExpression: return this.bindObjectInitializerExpression(syntax);
            case SyntaxKind.PropertyInitializerExpression: return this.bindPropertyInitializerExpression(syntax);

            case SyntaxKind.ElementAccessExpression: return this.bindElementAccessExpression(syntax);
            case SyntaxKind.InvocationExpression: return this.bindCallExpression(syntax);
            case SyntaxKind.MemberAccessExpression: return this.bindMemberAccessExpression(syntax);
            case SyntaxKind.ConversionExpression: return this.bindConversionExpression(syntax);

            case SyntaxKind.GroupExpression: return this.bindGroupExpression(syntax);
            case SyntaxKind.LambdaExpression: return this.bindLambdaExpression(syntax);

            case SyntaxKind.UnaryPlusExpression:
            case SyntaxKind.UnaryMinusExpression:
            case SyntaxKind.OnesComplementExpression:
            case SyntaxKind.NotExpression: return this.bindUnaryExpression(syntax);

            case SyntaxKind.AddExpression:
            case SyntaxKind.SubtractExpression:
            case SyntaxKind.MultiplyExpression:
            case SyntaxKind.DivideExpression:
            case SyntaxKind.ModuloExpression:
            case SyntaxKind.PowerExpression:
            case SyntaxKind.LeftShiftExpression:
            case SyntaxKind.RightShiftExpression:
            case SyntaxKind.LogicalOrExpression:
            case SyntaxKind.LogicalAndExpression:
            case SyntaxKind.BitwiseOrExpression:
            case SyntaxKind.BitwiseAndExpression:
            case SyntaxKind.ExclusiveOrExpression:
            case SyntaxKind.EqualsExpression:
            case SyntaxKind.NotEqualsExpression:
            case SyntaxKind.LessThanExpression:
            case SyntaxKind.LessThanOrEqualExpression:
            case SyntaxKind.GreaterThanExpression:
            case SyntaxKind.GreaterThanOrEqualExpression:
            case SyntaxKind.CoalesceExpression: return this.bindBinaryExpression(syntax);

            case SyntaxKind.AssignmentExpression: return this.bindAssignmentExpression(syntax);

            case SyntaxKind.IfElseExpression: return this.bindIfElseExpression(syntax);
            case SyntaxKind.WhileExpression: return this.bindWhileExpression(syntax);

            case SyntaxKind.ContinueExpression: return this.bindContinueExpression(syntax);
            case SyntaxKind.BreakExpression: return this.bindBreakExpression(syntax);
            case SyntaxKind.ReturnExpression: return this.bindReturnExpression(syntax);

            default:
                throw new Error(`Invalid Syntax`);
        }
    }

    bindDeclaration(syntax: GlobalDeclarationSyntax | LocalDeclarationSyntax): BoundDeclaration {
        if (syntax.initializer instanceof ModuleExpressionSyntax) {
            const initializer = this.#bindModuleExpression(syntax.initializer, syntax.name.getName());
            this.declare(initializer.symbol);
            return this.#recordDeclaration(initializer.symbol, initializer, syntax);
        }

        if (syntax.initializer instanceof StructExpressionSyntax) {
            const initializer = this.#bindStructExpression(syntax.initializer, syntax.name.getName());
            this.declare(initializer.symbol);
            return this.#recordDeclaration(initializer.symbol, initializer, syntax);
        }

        const explicitType = syntax.type ? this.bindType(syntax.type) : undefined;
        let initializer = this.#bindDeclarationInitializer(syntax, explicitType);
        const type = explicitType ?? initializer?.type ?? this.module.unknownType;
        if (initializer && !type.equals(initializer.type))
            initializer = this.bindConversion(initializer, type);
        const variable = new VariableSymbol(syntax.name.getFullName(), type, this.module, isReadOnly(syntax), isStatic(syntax), syntax);
        if (!this.declare(variable)) {
            // TODO: Report redeclaration of symbol
        }
        return this.#recordDeclaration(variable, initializer, syntax);
    }

    bindExpressionStatement(syntax: ExpressionStatementSyntax): BoundStatement {
        const expression = this.bind(syntax.expression);
        return new BoundExpressionStatement(expression, syntax);
    }

    bindLiteralExpression(syntax: LiteralExpressionSyntax): BoundExpression {
        switch (syntax.syntaxKind) {
            case SyntaxKind.I8LiteralExpression: return new BoundLiteralExpression(this.module.i8Type, syntax.literalToken.value, syntax);
            case SyntaxKind.U8LiteralExpression: return new BoundLiteralExpression(this.module.u8Type, syntax.literalToken.value, syntax);
            case SyntaxKind.I16LiteralExpression: return new BoundLiteralExpression(this.module.i16Type, syntax.literalToken.value, syntax);
            case SyntaxKind.U16LiteralExpression: return new BoundLiteralExpression(this.module.u16Type, syntax.literalToken.value, syntax);
            case SyntaxKind.I32LiteralExpression: return new BoundLiteralExpression(this.module.i32Type, syntax.literalToken.value, syntax);
            case SyntaxKind.U32LiteralExpression: return new BoundLiteralExpression(this.module.u32Type, syntax.literalToken.value, syntax);
            case SyntaxKind.I64LiteralExpression: return new BoundLiteralExpression(this.module.i64Type, syntax.literalToken.value, syntax);
            case SyntaxKind.U64LiteralExpression: return new BoundLiteralExpression(this.module.u64Type, syntax.literalToken.value, syntax);
            case SyntaxKind.F16LiteralExpression: return new BoundLiteralExpression(this.module.f16Type, syntax.literalToken.value, syntax);
            case SyntaxKind.F32LiteralExpression: return new BoundLiteralExpression(this.module.f32Type, syntax.literalToken.value, syntax);
            case SyntaxKind.F64LiteralExpression: return new BoundLiteralExpression(this.module.f64Type, syntax.literalToken.value, syntax);
            case SyntaxKind.StrLiteralExpression: return new BoundLiteralExpression(this.module.strType, syntax.literalToken.value, syntax);
            case SyntaxKind.TrueLiteralExpression: return new BoundLiteralExpression(this.module.boolType, syntax.literalToken.value, syntax);
            case SyntaxKind.FalseLiteralExpression: return new BoundLiteralExpression(this.module.boolType, syntax.literalToken.value, syntax);
            case SyntaxKind.NullLiteralExpression: return new BoundLiteralExpression(this.module.unitType, syntax.literalToken.value, syntax);
        }

        // Report invalid literal.
        return this.#createNeverExpression(syntax);
    }

    bindModuleExpression(syntax: ModuleExpressionSyntax): BoundExpression {
        return this.#bindModuleExpression(syntax, "<module>");
    }

    bindStructExpression(syntax: StructExpressionSyntax): BoundExpression {
        return this.#bindStructExpression(syntax, "<struct>");
    }

    bindNameExpression(syntax: NameExpressionSyntax): BoundExpression {
        const symbol = this.#lookupName(syntax.name.getFullName());
        if (!symbol) {
            // TODO: Report undefined symbol.
            return this.#createNeverExpression(syntax);
        }

        return this.#bindSymbolExpression(symbol, undefined, syntax);
    }

    bindBlockExpression(syntax: BlockExpressionSyntax): BoundExpression {
        const blockBinder = new BlockBinder(this);
        const items = new Array<BoundNode>(syntax.items.length);
        for (const itemSyntax of syntax.items)
            items.push(blockBinder.bind(itemSyntax));
        const last = items.at(-1);
        const type = isExpression(last) ? last.type : this.module.unitType;
        return new BoundBlockExpression(type, items, syntax);
    }

    bindArrayInitializerExpression(syntax: ArrayInitializerExpressionSyntax): BoundExpression {
        const elements = new Array<BoundExpression>(syntax.elements.length);
        for (const elementSyntax of syntax.elements) {
            const element = this.bind(elementSyntax);
            if (element.type.isNever) return this.#createNeverExpression(syntax);
            elements.push(element);
        }
        const arrayType = new ArrayTypeSymbol(this.#createTypeFromTypes(elements.map(x => x.type)), elements.length, this.module.global, syntax);
        return new BoundArrayExpression(arrayType, elements, syntax);
    }

    bindObjectInitializerExpression(syntax: ObjectInitializerExpressionSyntax): BoundExpression {
        const typeName = this.bind(syntax.typeName);
        if (!(typeName instanceof BoundTypeExpression) || !(typeName.symbol instanceof StructTypeSymbol)) {
            // TODO: Report not a type.
            return this.#createNeverExpression(syntax);
        }

        // TODO: Check required properties, default initializers, etc.
        const properties = new Array<BoundPropertyInitializerExpression>();
        const typeBinder = new TypeBinder(typeName.symbol, this);
        for (const propertySyntax of syntax.properties) {
            const property = typeBinder.bind(propertySyntax);
            if (!(property instanceof BoundPropertyInitializerExpression)) return this.#createNeverExpression(syntax);
            properties.push(property);
        }

        return new BoundObjectInitializerExpression(typeName, properties, syntax);
    }

    bindPropertyInitializerExpression(syntax: PropertyInitializerExpression): BoundExpression {
        if (!(this instanceof TypeBinder)) {
            throw new Error(`Tried to bind type in wrong scope`);
        }
        const property = this.lookup(syntax.propertyName.getFullName());
        if (!(property instanceof PropertySymbol)) {
            // TODO: Report not a property.
            return this.#createNeverExpression(syntax);
        }
        if (property.isStatic) {
            // TODO: Report static assignment on instance. Static symbols must be readonly for now.
            return this.#createNeverExpression(syntax);
        }
        if (property.isReadOnly) {
            // TODO: Report readonly assignment.
            return this.#createNeverExpression(syntax);
        }
        const value = this.bindConversion(this.bind(syntax.propertyValue), property.type);
        if (value.type.isNever) {
            return this.#createNeverExpression(syntax);
        }
        return new BoundPropertyInitializerExpression(property, value, syntax);
    }

    bindElementAccessExpression(syntax: ElementAccessExpressionSyntax): BoundExpression {
        const receiver = this.bind(syntax.receiver);
        const index = this.bind(syntax.index);
        const operatorName = makeOperatorName("Index", index.type);
        const typeBinder = new TypeBinder(receiver.type, this);
        const indexer = typeBinder.lookup(operatorName);
        if (!indexer) {
            // TODO: Report undefined symbol/member.
            return this.#createNeverExpression(syntax);
        }
        if (!(indexer instanceof IndexerSymbol)) {
            // TODO: Report not an indexer. Can this happen?
            return this.#createNeverExpression(syntax);
        }

        return new BoundElementLocation(indexer, receiver, index, syntax);
    }

    bindCallExpression(syntax: InvocationExpressionSyntax): BoundExpression {
        const callee = this.bind(syntax.callee);
        if (!(callee.type instanceof LambdaTypeSymbol)) {
            // TODO: Report undefined invocation operator / not a funcion.
            return this.#createNeverExpression(syntax);
        }

        if (callee.type.parameterTypes.length != syntax.arguments_.length) {
            // TODO: Report argument list mismatch.
            return this.#createNeverExpression(syntax);
        }

        const arguments_ = new Array<BoundExpression>(syntax.arguments_.length);
        for (let i = 0; i < syntax.arguments_.length; ++i) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const argument = this.bindConversion(this.bind(syntax.arguments_[i]!), callee.type.parameterTypes[i]!);
            if (argument.type.isNever) return this.#createNeverExpression(syntax);
            arguments_.push(argument);
        }

        return new BoundInvocationExpression(callee.type.returnType, callee, arguments_, syntax);
    }

    bindMemberAccessExpression(syntax: MemberAccessExpressionSyntax): BoundExpression {
        const receiver = this.bind(syntax.receiver);
        if (receiver instanceof BoundModuleExpression || receiver instanceof BoundTypeExpression) {
            const symbol = receiver.symbol.get(syntax.memberName.getFullName());
            if (!symbol) {
                // TODO: Report undefined symbol/member.
                return this.#createNeverExpression(syntax);
            }

            return this.#bindSymbolExpression(symbol, receiver, syntax);
        }

        const typeBinder = new TypeBinder(receiver.type, this);
        const member = typeBinder.lookup(syntax.memberName.getFullName());
        if (!member) {
            // TODO: Report undefined symbol/member.
            return this.#createNeverExpression(syntax);
        }
        if (!this.#isMember(member)) {
            // TODO: Report not a member. Can this happen?
            return this.#createNeverExpression(syntax);
        }

        return new BoundMemberLocation(member, receiver, syntax);
    }

    bindConversionExpression(syntax: ConversionExpressionSyntax): BoundExpression {
        const type = this.bindType(syntax.type);
        const expression = this.bind(syntax.expression);
        return this.bindConversion(expression, type);
    }

    bindGroupExpression(syntax: GroupExpressionSyntax): BoundExpression {
        return this.bind(syntax.expression);
    }

    bindLambdaExpression(syntax: LambdaExpressionSyntax): BoundExpression {
        if (!(this instanceof LambdaBinder)) {
            throw new Error(`Tried to bind lambda in wrong scope`);
        }
        if (!this.bindParameters(syntax)) {
            return this.#createNeverExpression(syntax);
        }
        const body = this.bindConversion(this.bind(syntax.body), this.lambdaType.returnType);
        return new BoundLambdaExpression(this.lambdaType, Array.from(this.parameters), body, syntax);
    }

    bindUnaryExpression(syntax: UnaryExpressionSyntax): BoundExpression {
        const operand = this.bind(syntax.operand);
        const operator = this.bindOperator(syntax.syntaxKind, operand.type);
        if (!operator) {
            return this.#createNeverExpression(syntax);
        }
        return new BoundUnaryExpression(operand, operator, syntax);
    }

    bindBinaryExpression(syntax: BinaryExpressionSyntax): BoundExpression {
        const left = this.bind(syntax.left);
        const right = this.bind(syntax.right);
        const operator = this.bindOperator(syntax.syntaxKind, left.type, right.type);
        if (!operator) {
            return this.#createNeverExpression(syntax);
        }
        return new BoundBinaryExpression(left, operator, right, syntax);
    }

    bindOperator(kind: UnaryExpressionSyntaxKind, operand: TypeSymbol): OperatorSymbol | undefined
    bindOperator(kind: BinaryExpressionSyntaxKind, left: TypeSymbol, right: TypeSymbol): OperatorSymbol | undefined
    bindOperator(kind: UnaryExpressionSyntaxKind | BinaryExpressionSyntaxKind, left: TypeSymbol, right?: TypeSymbol): OperatorSymbol | undefined {
        const operatorId = this.#getOperatorId(kind);
        const operatorName = right ? makeOperatorName(operatorId, left, right) : makeOperatorName(operatorId, left);
        const leftBinder = new TypeBinder(left, this);
        let operator = leftBinder.lookup(operatorName);
        if (operator instanceof OperatorSymbol) return operator;
        if (!right) {
            // TODO: Report undefined unary operator.
            return undefined;
        }
        const rightBinder = new TypeBinder(right, this);
        operator = rightBinder.lookup(operatorName);
        if (operator instanceof OperatorSymbol) return operator;
        // TODO: Report undefined binary operator.
        return undefined;
    }

    #getOperatorId(kind: UnaryExpressionSyntaxKind | BinaryExpressionSyntaxKind): UnaryOperatorId | BinaryOperatorId {
        switch (kind) {
            case SyntaxKind.UnaryPlusExpression: return 'UnaryPlus';
            case SyntaxKind.UnaryMinusExpression: return 'UnaryMinus';
            case SyntaxKind.OnesComplementExpression: return 'OnesComplement';
            case SyntaxKind.NotExpression: return 'Not';
            case SyntaxKind.AddExpression: return 'Add';
            case SyntaxKind.SubtractExpression: return 'Subtract';
            case SyntaxKind.MultiplyExpression: return 'Multiply';
            case SyntaxKind.DivideExpression: return 'Divide';
            case SyntaxKind.ModuloExpression: return 'Modulo';
            case SyntaxKind.PowerExpression: return 'Power';
            case SyntaxKind.LeftShiftExpression: return 'LeftShift';
            case SyntaxKind.RightShiftExpression: return 'RightShift';
            case SyntaxKind.LogicalOrExpression: return 'LogicalOr';
            case SyntaxKind.LogicalAndExpression: return 'LogicalAnd';
            case SyntaxKind.BitwiseOrExpression: return 'BitwiseOr';
            case SyntaxKind.BitwiseAndExpression: return 'BitwiseAnd';
            case SyntaxKind.ExclusiveOrExpression: return 'ExclusiveOr';
            case SyntaxKind.EqualsExpression: return 'Equals';
            case SyntaxKind.NotEqualsExpression: return 'NotEquals';
            case SyntaxKind.LessThanExpression: return 'LessThan';
            case SyntaxKind.LessThanOrEqualExpression: return 'LessThanOrEqual';
            case SyntaxKind.GreaterThanExpression: return 'GreaterThan';
            case SyntaxKind.GreaterThanOrEqualExpression: return 'GreaterThanOrEqual';
            case SyntaxKind.CoalesceExpression: return 'Coalesce';
            default: throw new Error(`Invalid binary operator syntax kind`);
        }
    }

    bindAssignmentExpression(syntax: AssignmentExpressionSyntax): BoundExpression {
        const location = this.bind(syntax.location);
        if (!this.#isLocation(location)) {
            // TODO: Report invalid assignment.
            return this.#createNeverExpression(syntax);
        }
        if (location.symbol.isReadOnly) {
            // TODO: Report readonly assignment.
            return this.#createNeverExpression(syntax);
        }

        const value = this.bindConversion(this.bind(syntax.value), location.type);
        return new BoundAssignmentExpression(location, value, syntax);
    }

    bindIfElseExpression(syntax: IfElseExpressionSyntax): BoundExpression {
        const condition = this.bindConversion(this.bind(syntax.condition), this.module.boolType);
        const then = this.bind(syntax.then);
        const else_ = syntax.elseClause ? this.bind(syntax.elseClause.expression) : this.#createUnitExpression(syntax);
        return new BoundIfElseExpression(this.#createTypeFromTypes(then.type, else_.type), condition, then, else_, syntax);
    }

    bindWhileExpression(syntax: WhileExpressionSyntax): BoundExpression {
        const condition = this.bindConversion(this.bind(syntax.condition), this.module.boolType);
        const binder = new LoopBinder(this);
        const body = binder.bind(syntax.body);
        return new BoundWhileExpression(condition, body, syntax);
    }

    bindContinueExpression(syntax: ContinueExpressionSyntax): BoundExpression {
        const lambdaType = this.#getEnclosingLambdaType();
        if (!lambdaType) {
            // TODO: Report invalid continue.
            return new BoundNeverExpression(this.module.neverType, syntax);
        }

        const expression = this.bindConversion(syntax.expression
            ? this.bind(syntax.expression)
            : this.#createUnitExpression(syntax), lambdaType.returnType);

        return new BoundContinueExpression(expression, syntax);
    }

    bindBreakExpression(syntax: BreakExpressionSyntax): BoundExpression {
        const lambdaType = this.#getEnclosingLambdaType();
        if (!lambdaType) {
            // TODO: Report invalid break.
            return new BoundNeverExpression(this.module.neverType, syntax);
        }

        const expression = this.bindConversion(syntax.expression
            ? this.bind(syntax.expression)
            : this.#createUnitExpression(syntax), lambdaType.returnType);

        return new BoundBreakExpression(expression, syntax);
    }

    bindReturnExpression(syntax: ReturnExpressionSyntax): BoundExpression {
        const lambdaType = this.#getEnclosingLambdaType();
        if (!lambdaType) {
            // TODO: Report invalid return.
            return new BoundNeverExpression(this.module.neverType, syntax);
        }

        const expression = this.bindConversion(syntax.expression
            ? this.bind(syntax.expression)
            : this.#createUnitExpression(syntax), lambdaType.returnType);

        return new BoundReturnExpression(expression, syntax);
    }

    bindConversion(expression: BoundExpression, type: TypeSymbol): BoundExpression {
        console.log("Converting expression", expression, "to", type);
        if (expression.type.isNever) return expression;
        if (type.isNever) return this.#createNeverExpression(expression.syntax);
        return expression;
    }

    bindType(syntax: TypeSyntax): TypeSymbol {
        switch (syntax.syntaxKind) {
            case SyntaxKind.AnyType: return this.module.anyType;
            //case SyntaxKind.ErrType: return this.module.errType;
            case SyntaxKind.ErrorType: return this.module.neverType;
            case SyntaxKind.UnknownType: return this.module.unknownType;
            case SyntaxKind.NeverType: return this.module.neverType;
            case SyntaxKind.UnitType: return this.module.unitType;
            case SyntaxKind.TypeType: return this.module.typeType;
            case SyntaxKind.StrType: return this.module.strType;
            case SyntaxKind.BoolType: return this.module.boolType;
            case SyntaxKind.I8Type: return this.module.i8Type;
            case SyntaxKind.I16Type: return this.module.i16Type;
            case SyntaxKind.I32Type: return this.module.i32Type;
            case SyntaxKind.I64Type: return this.module.i64Type;
            case SyntaxKind.IszType: return this.module.iszType;
            case SyntaxKind.U8Type: return this.module.u8Type;
            case SyntaxKind.U16Type: return this.module.u16Type;
            case SyntaxKind.U32Type: return this.module.u32Type;
            case SyntaxKind.U64Type: return this.module.u64Type;
            case SyntaxKind.UszType: return this.module.uszType;
            case SyntaxKind.F16Type: return this.module.f16Type;
            case SyntaxKind.F32Type: return this.module.f32Type;
            case SyntaxKind.F64Type: return this.module.f64Type;
            case SyntaxKind.ArrayType: {
                const arrayTypeSyntax = syntax as ArrayTypeSyntax;
                const elementType = this.bindType(arrayTypeSyntax.elementType);
                if (elementType.isNever) return elementType;
                let length: number | undefined;
                if (arrayTypeSyntax.length) {
                    if (arrayTypeSyntax.length.syntaxKind == SyntaxKind.I64LiteralExpression) {
                        length = arrayTypeSyntax.length.literalToken.value as number;
                    }
                    else {
                        // TODO: Report invalid array expression. Must be const.
                        return this.module.neverType;
                    }
                }
                return new ArrayTypeSymbol(elementType, length, this.module.global, syntax);
            }
            case SyntaxKind.LambdaType: {
                const lambdaTypeSyntax = syntax as LambdaTypeSyntax;
                const parameterTypes = new Array<TypeSymbol>();
                for (const parameter of lambdaTypeSyntax.parameters) {
                    const parameterType = this.bindType(parameter);
                    if (parameterType.isNever) return parameterType;
                    parameterTypes.push(parameterType);
                }
                const returnType = this.bindType(lambdaTypeSyntax.returnType);
                if (returnType.isNever) return returnType;
                return new LambdaTypeSymbol(parameterTypes, returnType, this.module.global, syntax);
            }
            case SyntaxKind.NamedType: {
                const namedTypeSyntax = syntax as NamedTypeSyntax;
                const name = namedTypeSyntax.name.getFullName();
                const symbol = this.#lookupName(name);
                if (!(symbol instanceof TypeSymbol)) {
                    // TODO: Report undefined symbol/type.
                    return this.module.neverType;
                }
                return symbol;
            }
            case SyntaxKind.MaybeType: {
                const maybeTypeSyntax = syntax as MaybeTypeSyntax;
                const underlyingType = this.bindType(maybeTypeSyntax.underlyingType);
                if (underlyingType.name === PredefinedTypeNames.never) return underlyingType;
                return new UnionTypeSymbol([underlyingType, this.module.unitType], this.module.global, syntax);
            }
            case SyntaxKind.PointerType: {
                const pointerTypeSyntax = syntax as PointerTypeSyntax;
                const elementType = this.bindType(pointerTypeSyntax.elementType);
                if (elementType.isNever) return elementType;
                return new PointerTypeSymbol(elementType, this.module.global, syntax);
            }
            case SyntaxKind.UnionType: {
                const unionTypeSyntax = syntax as UnionTypeSyntax;
                const types = new Array<TypeSymbol>(unionTypeSyntax.types.length);
                for (const typeSyntax of unionTypeSyntax.types) {
                    const type = this.bindType(typeSyntax);
                    if (type.isNever) return type;
                    types.push(type);
                }
                return new UnionTypeSymbol(types, this.module.global, syntax);
            }
            default:
                // TODO: Report invalid type syntax.
                return this.module.neverType;
        }
    }

    #createUnitExpression(syntax: SyntaxNode): BoundLiteralExpression {
        return new BoundLiteralExpression(this.module.unitType, null, syntax);
    }

    #bindDeclarationInitializer(
        syntax: GlobalDeclarationSyntax | LocalDeclarationSyntax,
        explicitType: TypeSymbol | undefined): BoundExpression | undefined {
        if (!syntax.initializer) return undefined;

        if (syntax.initializer instanceof LambdaExpressionSyntax && explicitType instanceof LambdaTypeSymbol) {
            return new LambdaBinder(explicitType, this).bind(syntax.initializer);
        }

        return this.bind(syntax.initializer);
    }

    #recordDeclaration(
        symbol: Symbol,
        initializer: BoundExpression | undefined,
        syntax: SyntaxNode): BoundDeclaration {
        const declaration = new BoundDeclaration(symbol, initializer, syntax);
        this.context.declarations.set(symbol, declaration);
        return declaration;
    }

    #bindModuleExpression(syntax: ModuleExpressionSyntax, name: string): BoundModuleExpression {
        return new BoundModuleExpression(new ModuleSymbol(name, this.module, syntax), syntax);
    }

    #bindStructExpression(syntax: StructExpressionSyntax, name: string): BoundTypeExpression {
        const type = new StructTypeSymbol(name, this.module, syntax);
        const typeBinder = new TypeBinder(type, this);
        for (const propertySyntax of syntax.properties) {
            let initializer = propertySyntax.initializer
                ? typeBinder.bind(propertySyntax.initializer)
                : undefined;
            const propertyType = propertySyntax.type
                ? this.bindType(propertySyntax.type)
                : initializer?.type ?? this.module.unknownType;
            if (initializer && !propertyType.equals(initializer.type)) {
                initializer = typeBinder.bindConversion(initializer, propertyType);
            }

            const property = new PropertySymbol(
                propertySyntax.name.getFullName(),
                propertyType,
                type,
                isReadOnly(propertySyntax),
                isStatic(propertySyntax),
                propertySyntax);
            if (!typeBinder.declare(property)) {
                // TODO: Report redeclaration of symbol.
            }
            this.#recordDeclaration(property, initializer, propertySyntax);
        }

        return new BoundTypeExpression(type, syntax);
    }

    #lookupName(name: string): Symbol | undefined {
        const parts = name.split(".");
        const first = parts[0];
        if (!first) return undefined;
        let symbol = this.lookup(first);
        for (let i = 1; symbol && i < parts.length; ++i) {
            const part = parts[i];
            if (!part) return undefined;
            if (symbol instanceof ModuleSymbol || symbol instanceof TypeSymbol) {
                symbol = symbol.get(part);
            }
            else {
                return undefined;
            }
        }

        return symbol;
    }

    #bindSymbolExpression(symbol: Symbol, receiver: BoundExpression | undefined, syntax: SyntaxNode): BoundExpression {
        if (symbol instanceof ModuleSymbol) return new BoundModuleExpression(symbol, syntax);
        if (symbol instanceof TypeSymbol) return new BoundTypeExpression(symbol, syntax);
        if (symbol instanceof VariableSymbol) return new BoundVariableLocation(symbol, syntax);
        if (symbol instanceof PropertySymbol) {
            if (receiver instanceof BoundTypeExpression && !symbol.isStatic) {
                // TODO: Report instance member access through type.
                return this.#createNeverExpression(syntax);
            }
            return new BoundMemberLocation(symbol, symbol.isStatic ? undefined : receiver, syntax);
        }

        // TODO: Operators and indexers are resolved by their syntax, not as standalone values.
        return this.#createNeverExpression(syntax);
    }

    #createNeverExpression(syntax: SyntaxNode): BoundNeverExpression {
        return new BoundNeverExpression(this.module.neverType, syntax);
    }

    #createTypeFromTypes(firstOrTypes: TypeSymbol | readonly TypeSymbol[], ...rest: TypeSymbol[]): TypeSymbol {
        const [first, types] = Array.isArray(firstOrTypes)
            ? [firstOrTypes[0] as TypeSymbol | undefined, firstOrTypes.slice(1) as readonly TypeSymbol[]]
            : [firstOrTypes as TypeSymbol, rest];

        if (!first || types.length === 0) return first ?? this.module.unknownType;
        const others = types.filter(other => !first.equals(other));
        if (others.length === 0) return first;
        // TODO: Should containing module for synthetic unions always be global?
        const containingModule = first.containingModule.global;
        return new UnionTypeSymbol([first, ...others], containingModule, undefined);
    }


    #getEnclosingLambdaType(): LambdaTypeSymbol | undefined {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        for (let current: Binder | undefined = this; current; current = current.parent) {
            if (current instanceof LambdaBinder) {
                return current.lambdaType;
            }
        }
        return undefined;
    }

    #isLocation(expression: BoundExpression): expression is BoundLocation {
        return expression instanceof BoundVariableLocation
            || expression instanceof BoundMemberLocation
            || expression instanceof BoundElementLocation;
    }

    #isMember(symbol: Symbol): symbol is MemberSymbol {
        return symbol instanceof PropertySymbol
            || symbol instanceof IndexerSymbol
            || symbol instanceof OperatorSymbol;
    }
}

export class ModuleBinder extends Binder {
    constructor(readonly module: ModuleSymbol, parent?: Binder, context?: BindingContext) {
        super(parent, context);
    }
    override declare(symbol: Symbol): boolean { return this.module.add(symbol); }
    override lookup(name: string): Symbol | undefined { return this.module.get(name) ?? this.parent?.lookup(name); }
}

export class TypeBinder extends Binder {
    override get module() { return this.type.containingModule; }
    constructor(readonly type: TypeSymbol, parent?: Binder) {
        super(parent);
    }
    override declare(symbol: Symbol): boolean { return this.type.add(symbol); }
    override lookup(name: string): Symbol | undefined { return this.type.get(name) ?? this.parent?.lookup(name); }
}

// export class MemberBinder extends Binder {
//     override get module() { return this.parent.module; }
//     constructor(readonly receiver: BoundExpression, override readonly parent: TypeBinder) {
//         super(parent);
//     }
//     override declare(symbol: Symbol): boolean { return this.type.add(symbol); }
//     override lookup(name: string): Symbol | undefined { return this.type.get(name) ?? this.parent.lookup(name); }
// }

export class BlockBinder extends Binder {
    #locals?: Map<string, VariableSymbol>;
    override get module() { return this.parent.module; }
    constructor(override readonly parent: Binder) {
        super(parent);
    }
    override declare(symbol: Symbol): boolean {
        if (!(symbol instanceof VariableSymbol)) return false; // TODO: We need to report this.
        if (this.#locals) {
            if (this.#locals.has(symbol.name)) return false;
            this.#locals.set(symbol.name, symbol);
            return true;
        }
        this.#locals = new Map([[symbol.name, symbol]]);
        return true;
    }
    override lookup(name: string): Symbol | undefined {
        return this.#locals?.get(name) ?? this.parent.lookup(name);
    }
}

export class LoopBinder extends Binder {
    override get module() { return this.parent.module; }
    constructor(override readonly parent: Binder) {
        super(parent);
    }
    override declare(symbol: Symbol): boolean { return this.parent.declare(symbol); }
    override lookup(name: string): Symbol | undefined { return this.parent.lookup(name); }

}

export class LambdaBinder extends Binder {
    #parameters?: Map<string, VariableSymbol>;
    #captures?: Map<string, VariableSymbol>;
    override get module() { return this.parent.module; }
    get parameters(): Iterable<VariableSymbol> { return this.#parameters ? this.#parameters.values() : []; }
    constructor(readonly lambdaType: LambdaTypeSymbol, override readonly parent: Binder) {
        super(parent);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override declare(symbol: Symbol): boolean { throw new Error("Unexpected declaration in lambda") }
    override lookup(name: string): Symbol | undefined {
        const parameter = this.#parameters?.get(name);
        if (parameter) return parameter;
        const capture = this.parent.lookup(name);
        if (capture && capture instanceof VariableSymbol) (this.#captures ??= new Map()).set(capture.name, capture);
        return capture;
    }

    bindParameters(syntax: LambdaExpressionSyntax): boolean {
        if (this.#parameters) {
            throw new Error(`Unexpected redeclaration of parameters in LambdaBinder`);
        }

        const parameterNames = new Array<string>();
        for (const parameter of syntax.parameters) parameterNames.push(parameter.identifierToken.getValueText());
        const parameterTypes = this.lambdaType.parameterTypes;
        if (parameterNames.length != parameterTypes.length) {
            const range = Range.create(syntax.parenthesisOpenToken.sourceSpan.range.start, syntax.parenthesisCloseToken.sourceSpan.range.end);
            const span = new SourceSpan(syntax.parenthesisOpenToken.sourceSpan.sourceText, range);
            // TODO: Report invalid parameter count by using span above.
            console.log(span);
            return false;
        }

        this.#parameters = new Map();
        for (let i = 0; i < parameterNames.length; ++i) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const parameter = new VariableSymbol(parameterNames[i]!, parameterTypes[i]!, this.module, true, false, syntax.parameters[i])
            if (this.#parameters.has(parameter.name)) {
                // TODO: Report symbol/parameter redeclaration.
                return false;
            }
            this.#parameters.set(parameter.name, parameter);
        }

        return true;
    }

}
