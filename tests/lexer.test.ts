import { describe, expect, it } from "vitest";

import { Lexer } from "../src/syntax/lexer.js";
import { SyntaxFacts } from "../src/syntax-facts.js";
import { SyntaxKind } from "../src/syntax-kind.js";
import type { SyntaxToken } from "../src/syntax-token.js";
import { SourceText } from "../src/text/source-text.js";

type TokenCase = {
  readonly syntaxKind: SyntaxKind;
  readonly text: string;
  readonly value?: unknown;
};

function scan(text: string): { readonly lexer: Lexer; readonly tokens: readonly SyntaxToken[] } {
  const lexer = new Lexer(new SourceText(text));
  return { lexer, tokens: Array.from(lexer.scanAll()) };
}

function syntaxTextTokenCases(): readonly TokenCase[] {
  const cases = new Array<TokenCase>();

  for (const value of Object.values(SyntaxKind)) {
    if (typeof value !== "number") continue;
    if (
      value === SyntaxKind.BracketOpenBracketCloseToken ||
      value === SyntaxKind.ParenthesisOpenParenthesisCloseToken
    )
      continue;

    const text = SyntaxFacts.getText(value);
    if (text !== undefined) cases.push({ syntaxKind: value, text });
  }

  return cases;
}

const literalTokenCases: readonly TokenCase[] = [
  { syntaxKind: SyntaxKind.IdentifierToken, text: "a" },
  { syntaxKind: SyntaxKind.IdentifierToken, text: "_a1" },
  { syntaxKind: SyntaxKind.I8LiteralToken, text: "42i8", value: 42 },
  { syntaxKind: SyntaxKind.U8LiteralToken, text: "42u8", value: 42 },
  { syntaxKind: SyntaxKind.I16LiteralToken, text: "42i16", value: 42 },
  { syntaxKind: SyntaxKind.U16LiteralToken, text: "42u16", value: 42 },
  { syntaxKind: SyntaxKind.I32LiteralToken, text: "2147483647", value: 2147483647 },
  { syntaxKind: SyntaxKind.I32LiteralToken, text: "0x1A3F", value: 0x1a3f },
  { syntaxKind: SyntaxKind.I32LiteralToken, text: "0b101010", value: 42 },
  { syntaxKind: SyntaxKind.U32LiteralToken, text: "42u32", value: 42 },
  { syntaxKind: SyntaxKind.I64LiteralToken, text: "2147483648", value: 2147483648n },
  { syntaxKind: SyntaxKind.I64LiteralToken, text: "42i64", value: 42n },
  { syntaxKind: SyntaxKind.U64LiteralToken, text: "42u64", value: 42n },
  { syntaxKind: SyntaxKind.F32LiteralToken, text: "42f32", value: 42 },
  { syntaxKind: SyntaxKind.F64LiteralToken, text: ".2", value: 0.2 },
  { syntaxKind: SyntaxKind.F64LiteralToken, text: "4.2e2", value: 420 },
  { syntaxKind: SyntaxKind.StrLiteralToken, text: '"test"', value: "test" },
  { syntaxKind: SyntaxKind.StrLiteralToken, text: '"te\\"st"', value: 'te"st' }
];

describe("Lexer", () => {
  it.each([...syntaxTextTokenCases(), ...literalTokenCases])(
    "scans $text as $syntaxKind",
    ({ syntaxKind, text, value }) => {
      const { lexer, tokens } = scan(text);

      expect(tokens).toHaveLength(2);
      expect(tokens[0]?.syntaxKind).toBe(syntaxKind);
      expect(tokens[0]?.getText()).toBe(text);
      if (value !== undefined) expect(tokens[0]?.value).toBe(value);
      expect(tokens[1]?.syntaxKind).toBe(SyntaxKind.EofToken);
      expect(lexer.diagnostics).toHaveLength(0);
    }
  );

  it.each([
    { syntaxKind: SyntaxKind.WhiteSpaceTrivia, text: " " },
    { syntaxKind: SyntaxKind.WhiteSpaceTrivia, text: "\t" },
    { syntaxKind: SyntaxKind.LineBreakTrivia, text: "\r" },
    { syntaxKind: SyntaxKind.LineBreakTrivia, text: "\n" },
    { syntaxKind: SyntaxKind.LineBreakTrivia, text: "\r\n" },
    {
      syntaxKind: SyntaxKind.SingleLineCommentTrivia,
      text: "// comment\n",
      expectedText: "// comment"
    },
    { syntaxKind: SyntaxKind.MultiLineCommentTrivia, text: "/* comment */" }
  ])("scans $text as trivia", ({ syntaxKind, text, expectedText }) => {
    const { lexer, tokens } = scan(`a${text}b`);

    expect(tokens[0]?.syntaxKind).toBe(SyntaxKind.IdentifierToken);
    expect(tokens[0]?.trailingTrivia[0]?.syntaxKind).toBe(syntaxKind);
    expect(tokens[0]?.trailingTrivia[0]?.sourceSpan.getText()).toBe(expectedText ?? text);
    expect(tokens[1]?.syntaxKind).toBe(SyntaxKind.IdentifierToken);
    expect(tokens[1]?.getText()).toBe("b");
    expect(lexer.diagnostics).toHaveLength(0);
  });

  it("moves invalid text into leading trivia on the next valid token", () => {
    const { lexer, tokens } = scan("@name");

    expect(tokens[0]?.syntaxKind).toBe(SyntaxKind.IdentifierToken);
    expect(tokens[0]?.getText()).toBe("name");
    expect(tokens[0]?.leadingTrivia[0]?.syntaxKind).toBe(SyntaxKind.InvalidTextTrivia);
    expect(tokens[0]?.leadingTrivia[0]?.sourceSpan.getText()).toBe("@");
    expect(lexer.diagnostics).toHaveLength(1);
  });

  it("reports invalid number literals", () => {
    const { lexer, tokens } = scan("0b");

    expect(tokens[0]?.syntaxKind).toBe(SyntaxKind.I32LiteralToken);
    expect(tokens[0]?.getText()).toBe("0b");
    expect(lexer.diagnostics).toHaveLength(1);
  });

  it("reports unterminated strings", () => {
    const { lexer, tokens } = scan('"open');

    expect(tokens[0]?.syntaxKind).toBe(SyntaxKind.StrLiteralToken);
    expect(tokens[0]?.getText()).toBe('"open');
    expect(tokens[0]?.value).toBe("open");
    expect(lexer.diagnostics).toHaveLength(1);
  });

  it("reports unterminated multi-line comments", () => {
    const { lexer, tokens } = scan("a/* open");

    expect(tokens[0]?.syntaxKind).toBe(SyntaxKind.IdentifierToken);
    expect(tokens[0]?.trailingTrivia[0]?.syntaxKind).toBe(SyntaxKind.MultiLineCommentTrivia);
    expect(tokens[0]?.trailingTrivia[0]?.sourceSpan.getText()).toBe("/* open");
    expect(lexer.diagnostics).toHaveLength(1);
  });
});
