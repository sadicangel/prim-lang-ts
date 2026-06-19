# prim-lang-ts

TypeScript project scaffold for a port of the Prim compiler.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Commands

- `npm run typecheck` checks TypeScript without emitting files.
- `npm run lint` runs ESLint.
- `npm run test` runs Vitest once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run coverage` runs tests with coverage output.
- `npm run build` emits compiled JavaScript and declarations to `dist`.
- `npm run check` runs type checking, linting, and tests.
- `npm run compile -- path/to/file.prim` runs the development CLI entry point.
- `npm run compile:built -- path/to/file.prim` runs the compiled CLI after `npm run build`.

## Layout

- `src/` is reserved for compiler source files.
- `tests/` is reserved for Vitest tests.
- `docs/` is reserved for porting notes and design docs.
