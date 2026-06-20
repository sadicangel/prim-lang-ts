# Prim

Prim is an experimental, statically typed programming language and compiler project. This
repository contains the TypeScript implementation of its lexer, syntax tree, and parser.

The language is expression-oriented: blocks, conditionals, loops, declarations, modules,
structs, and control-flow transfers are represented within the expression model.

> [!IMPORTANT]
> The lexer and parser are implemented and tested. Binding, type checking, evaluation, and
> code generation have not yet been ported, and the command-line tool currently only loads
> source files.

## Quick tour

```prim
Point :: struct {
    x: f64: 0;
    y: f64: 0;
};

origin :: Point {
    x = 0,
    y = 0
};

absolute: (i32) -> i32: (value) =>
    if (value < 0) -value else value;

answer := while (true) {
    break 42;
};
```

## Declarations

Every source file is a list of declarations. A declaration starts with a name and uses its
two punctuation marks to express typing and mutability.

| Form | Type | Binding |
| --- | --- | --- |
| `name: Type: value;` | explicit | immutable |
| `name: Type = value;` | explicit | mutable |
| `name :: value;` | inferred | immutable |
| `name := value;` | inferred | mutable |

```prim
port: u16: 8080u16;
attempts: i32 = 0;
greeting :: "hello";
running := true;
```

The same declaration syntax is used at file scope, inside blocks, and for struct
properties. Semicolons terminate declarations.

Names may be qualified with dots:

```prim
network.defaultPort: u16: 8080u16;
point: geometry.Point = origin;
```

## Types

### Predefined types

| Category | Types |
| --- | --- |
| Signed integers | `i8`, `i16`, `i32`, `i64`, `isz` |
| Unsigned integers | `u8`, `u16`, `u32`, `u64`, `usz` |
| Floating point | `f16`, `f32`, `f64` |
| General | `str`, `bool`, `unit`, `never`, `unknown`, `any`, `err`, `type` |

### Named and compound types

```prim
value: Widget = widget;             // named type
item: collections.Widget = widget; // qualified named type
values: i32[] = [1, 2, 3];         // unsized array
pair: i32[2] = [1, 2];             // sized array
pointer: i32* = address;            // pointer
optional: i32? = value;             // maybe type
choice: i32 | str = value;          // union
mapper: (i32, str) -> bool = fn;    // lambda type
```

Postfix type constructors may be chained, and they bind more tightly than unions:

```prim
result: i32[4]*? | str = value;
```

The implemented type grammar is:

```text
type        := postfix-type ("|" postfix-type)*
postfix-type:= primary-type ("[" expression? "]" | "*" | "?")*
primary-type:= predefined-type
             | qualified-name
             | "(" type-list? ")" "->" type
type-list   := type ("," type)* ","?
```

## Literals

### Numbers

Decimal integers default to `i32` when they fit and otherwise to `i64`. Integer suffixes
select an exact representation:

```prim
42
42i8
42u8
42i16
42u16
42i32
42u32
42i64
42u64
```

Binary and hexadecimal integers are supported:

```prim
0b101010
0x2A
```

Floating-point literals default to `f64` and support decimal exponents and explicit
suffixes:

```prim
.5
4.2e2
1.5f16
1.5f32
1.5f64
```

### Strings, booleans, and null

```prim
"hello"
"quote: \""
true
false
null
```

Strings are single-line. The currently supported string escape is `\"`.

## Modules and structs

Modules and structs are values introduced by expressions rather than dedicated declaration
forms. They are normally bound using the declaration syntax.

```prim
app :: module;

Point :: struct {
    x: f64: 0;
    y: f64: 0;
};
```

Struct values use a name followed by property initializers:

```prim
point :: Point {
    x = 10,
    y = 20
};
```

## Arrays

Array expressions contain comma-separated values:

```prim
empty :: [];
numbers: i32[3]: [1, 2, 3];
```

Arrays can be indexed, and indexing participates in postfix expression chaining:

```prim
first := numbers[0];
```

## Lambdas and calls

Lambda expressions contain parameter names. Their types are supplied by the surrounding
declaration or inferred by a later compiler phase.

```prim
add: (i32, i32) -> i32: (left, right) => left + right;

classify: (i32) -> str: (value) => {
    if (value < 0) "negative"
    else if (value > 0) "positive"
    else "zero"
};

result := add(20, 22);
```

A lambda body is any expression, including a block, conditional, loop, or `return`
expression.

## Blocks

A block is an expression containing declarations and expressions:

```prim
result :: {
    left :: 20;
    right :: 22;
    left + right
};
```

A semicolon terminates a block item. The final expression may omit its semicolon, making
its value the natural value of the block. Precise block typing and evaluation are reserved
for the semantic implementation.

## Control-flow expressions

### Conditional expressions

```prim
label := if (score >= 50) "pass" else "fail";
```

Parentheses around the condition are required. Each branch may be any expression.

The `else` branch is optional:

```prim
message := if (verbose) log();
```

Semantically, an `if` without `else` has type `T | unit`, where `T` is the type of the
then-expression.

`else` associates with the nearest unmatched `if`.

### While expressions

```prim
answer := while (true) {
    if (ready()) break calculate();
    continue;
};
```

The condition is parenthesized and the body may be any expression. A `break` may carry the
value produced by the loop; a valueless `break` produces `unit`.

### Break, continue, and return

These are expressions rather than statements:

```prim
break;
break value;
continue;
return;
return value;
```

They do not own their semicolons. The surrounding block uses the same item terminator as
for every other expression.

Their contextual validity—`break`/`continue` inside loops and `return` inside lambdas—will
be enforced by semantic analysis.

## Expressions

### Postfix expressions

Postfix operations may be chained:

```prim
service.create(1, 2)[0].name as str
```

Supported forms are:

- Calls: `callee(arguments)`
- Element access: `receiver[index]`
- Member access: `receiver.member`
- Struct initialization: `Type { property = value }`
- Conversion: `expression as Type`
- Assignment: `target = value`

### Unary operators

| Operator | Meaning |
| --- | --- |
| `+` | unary plus |
| `-` | unary minus |
| `~` | bitwise complement |
| `!` | logical negation |

### Binary operators

From highest to lowest precedence:

| Precedence | Operators |
| --- | --- |
| 7 | `**` |
| 6 | `*`, `/`, `%` |
| 5 | `+`, `-` |
| 4 | `<<`, `>>` |
| 3 | `==`, `!=`, `<`, `<=`, `>`, `>=` |
| 2 | `&`, `&&` |
| 1 | `|`, `||`, `^`, `??` |

Parentheses may be used to control grouping:

```prim
result := (a + b) * c;
```

## Comments and whitespace

```prim
// Single-line comment

/* Multi-line
   comment */
```

Whitespace and comments are preserved as syntax trivia.

## Grammar summary

This is a compact description of the currently implemented parser:

```text
compilation-unit := declaration* EOF

declaration      := name ":" type? binding-operator expression ";"
binding-operator := ":" | "="

expression       := control-flow
                  | unary-expression
                  | expression binary-operator expression
                  | expression "=" expression
                  | expression postfix

control-flow     := "if" "(" expression ")" expression ("else" expression)?
                  | "while" "(" expression ")" expression
                  | "break" expression?
                  | "continue"
                  | "return" expression?

primary          := literal
                  | name
                  | "module"
                  | "struct" "{" declaration* "}"
                  | "{" block-item* "}"
                  | "(" expression ")"
                  | "(" name-list? ")" "=>" expression
                  | "[" expression-list? "]"

postfix          := "(" expression-list? ")"
                  | "[" expression "]"
                  | "." simple-name
                  | "{" property-list? "}"
                  | "as" type

block-item       := declaration | expression ";"?
```

The four declaration spellings arise from the optional type and selected binding operator:

```text
name ":" type ":" expression ";"  // explicit immutable
name ":" type "=" expression ";"  // explicit mutable
name ":"      ":" expression ";"  // inferred immutable
name ":"      "=" expression ";"  // inferred mutable
```

## Reserved but not yet parsed

The lexer currently recognizes `for`, `implicit`, `explicit`, and `this`, but their
language forms are not implemented. Compound assignment tokens such as `+=` and `??=` are
also recognized but are not yet assignment expressions.

## Development

Requirements:

- Node.js 22 or newer
- npm 10 or newer

Commands:

- `npm run check` — type-check, lint, and run all tests
- `npm run typecheck` — type-check without emitting files
- `npm run lint` — run ESLint
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
- `npm run coverage` — generate test coverage
- `npm run build` — emit JavaScript and declarations to `dist`
- `npm run compile -- path/to/file.prim` — run the development CLI
- `npm run compile:built -- path/to/file.prim` — run the built CLI

Repository layout:

- `src/` — compiler implementation
- `tests/` — Vitest suites
- `docs/` — porting and design notes
