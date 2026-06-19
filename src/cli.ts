#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type CliIo = {
  readonly cwd: string;
  readonly stderr: (message: string) => void;
  readonly stdout: (message: string) => void;
};

const usage = `Usage: prim <file.prim>

Options:
  -h, --help    Show this help message`;

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

  const filePath = resolve(io.cwd, args.join(""));
  let sourceText: string;

  try {
    sourceText = await readFile(filePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`prim: cannot read ${filePath}: ${message}`);
    return 1;
  }

  io.stdout(`prim: loaded ${filePath} (${sourceText.length.toString()} characters)`);
  io.stdout("prim: compilation is not implemented yet");
  return 0;
}

process.exitCode = await runCli(process.argv.slice(2));
