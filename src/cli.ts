#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

import type { Diagnostic } from "./diagnostics/diagnostic.js";
import { Compilation } from "./binding/compilation.js";
import { Lexer } from "./syntax/lexer.js";
import { Parser } from "./syntax/parser.js";
import { SyntaxTokenStream } from "./syntax/syntax-token-stream.js";
import { SourceText } from "./text/source-text.js";

type CliIo = {
  readonly cwd: string;
  readonly stderr: (message: string) => void;
  readonly stdout: (message: string) => void;
};

const usage = `Usage: prim <file-or-directory>

Options:
  -h, --help    Show this help message

Compiles .prim files. Directory inputs are scanned recursively.`;

const defaultIo: CliIo = {
  cwd: process.cwd(),
  stderr: (message) => {
    console.error(message);
  },
  stdout: (message) => {
    console.log(message);
  }
};

export async function runCli(args: readonly string[], io: CliIo = defaultIo): Promise<number> {
  if (args.includes("-h") || args.includes("--help")) {
    io.stdout(usage);
    return 0;
  }

  if (args.length !== 1) {
    io.stderr(usage);
    return 1;
  }

  const inputPath = resolve(io.cwd, args[0] ?? "");
  let filePaths: readonly string[];

  try {
    filePaths = await findPrimFiles(inputPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`prim: cannot read ${inputPath}: ${message}`);
    return 1;
  }

  if (filePaths.length === 0) {
    io.stderr(`prim: no .prim files found in ${inputPath}`);
    return 1;
  }

  const diagnostics = new Array<Diagnostic>();
  const syntaxTrees = [];
  for (const filePath of filePaths) {
    const source = new SourceText(await readFile(filePath, "utf8"), filePath);
    const lexer = new Lexer(source);
    const parser = new Parser(new SyntaxTokenStream(lexer.scanAll()));
    const syntaxTree = parser.parse();
    syntaxTrees.push(syntaxTree);
    diagnostics.push(...lexer.diagnostics, ...parser.diagnostics);
  }

  const compilation = new Compilation(syntaxTrees);
  const declarations = compilation.bindAll();
  diagnostics.push(...compilation.diagnostics);

  for (const diagnostic of diagnostics) {
    io.stderr(formatDiagnostic(diagnostic));
  }

  if (diagnostics.length > 0) {
    io.stderr(`prim: failed with ${diagnostics.length.toString()} diagnostic(s)`);
    return 1;
  }

  io.stdout(`prim: compiled ${filePaths.length.toString()} file(s), ${declarations.length.toString()} top-level declaration(s)`);
  return 0;
}

async function findPrimFiles(inputPath: string): Promise<readonly string[]> {
  const info = await stat(inputPath);
  if (info.isFile()) return extname(inputPath) === ".prim" ? [inputPath] : [];
  if (!info.isDirectory()) return [];

  const filePaths = new Array<string>();
  await collectPrimFiles(inputPath, filePaths);
  return filePaths.sort((left, right) => left.localeCompare(right));
}

async function collectPrimFiles(directoryPath: string, filePaths: string[]): Promise<void> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      await collectPrimFiles(entryPath, filePaths);
    } else if (entry.isFile() && extname(entry.name) === ".prim") {
      filePaths.push(entryPath);
    }
  }
}

function formatDiagnostic(diagnostic: Diagnostic): string {
  const path = diagnostic.span.sourceText.path ?? "<unknown>";
  const line = diagnostic.span.startLine + 1;
  const character = diagnostic.span.startCharacter + 1;
  return `${path}:${line.toString()}:${character.toString()}: ${diagnostic.message}`;
}

process.exitCode = await runCli(process.argv.slice(2));
