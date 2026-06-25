import { SyntaxKind, type SyntaxTokenKind } from "../syntax-kind.js";
import { SyntaxToken, type LexerSyntaxKind } from "../syntax-token.js";
import { SyntaxTrivia } from "../syntax-trivia.js";
import { SyntaxFacts } from "../syntax-facts.js";
import {
  CharacterCode,
  isDigit,
  isDigitStart,
  isIdentifierPart,
  isIdentifierStart,
  isWhitespace as isWhiteSpace
} from "../text/character-code.js";
import type { SourceText } from "../text/source-text.js";
import { Diagnostic } from "../diagnostics/diagnostic.js";
import { SourceSpan } from "../text/source-span.js";
import { Range } from "../text/range.js";

export class Lexer {
  #position = 0;
  #diagnostics = new Array<Diagnostic>();

  get diagnostics(): readonly Diagnostic[] {
    return this.#diagnostics;
  }

  constructor(readonly sourceText: SourceText) { }

  *scanAll(): Iterable<SyntaxToken> {
    const badTokens = new Array<SyntaxToken>();
    while (true) {
      const syntaxToken = this.scanAny();
      if (syntaxToken.syntaxKind === SyntaxKind.InvalidSyntaxToken) {
        badTokens.push(syntaxToken);
        continue;
      }

      if (badTokens.length > 0) {
        const trivia = new Array<SyntaxTrivia>();
        for (const token of badTokens) {
          trivia.push(...token.leadingTrivia);
          trivia.push(new SyntaxTrivia(SyntaxKind.InvalidTextTrivia, token.sourceSpan));
          trivia.push(...token.trailingTrivia);
        }
        trivia.push(...syntaxToken.leadingTrivia);
        badTokens.length = 0;

        const mutable = syntaxToken.leadingTrivia as SyntaxTrivia[];
        mutable.length = 0;
        mutable.push(...trivia);
      }

      yield syntaxToken;
      if (syntaxToken.syntaxKind === SyntaxKind.EofToken) {
        break;
      }
    }
  }

  scanAny(): SyntaxToken {
    while (true) {
      const leadingTrivia = Array.from(this.#scanSyntaxTrivia());
      const [syntaxKind, sourceSpan, value] = this.#scanSyntaxKind();
      const trailingTrivia = Array.from(this.#scanSyntaxTrivia());
      return new SyntaxToken(syntaxKind, sourceSpan, leadingTrivia, trailingTrivia, value);
    }
  }

  #scanSyntaxKind(): [syntaxKind: LexerSyntaxKind, sourceSpan: SourceSpan, value: unknown] {
    const start = this.#position;
    if (this.sourceText.matchesAll(this.#position, CharacterCode.BraceOpen)) {
      this.#position += 1;
      return [
        SyntaxKind.BraceOpenToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.BraceClose)) {
      this.#position += 1;
      return [
        SyntaxKind.BraceCloseToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.ParenthesisOpen)) {
      this.#position += 1;
      return [
        SyntaxKind.ParenthesisOpenToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.ParenthesisClose)) {
      this.#position += 1;
      return [
        SyntaxKind.ParenthesisCloseToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.BracketOpen)) {
      this.#position += 1;
      return [
        SyntaxKind.BracketOpenToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.BracketClose)) {
      this.#position += 1;
      return [
        SyntaxKind.BracketCloseToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Colon)) {
      this.#position += 1;
      return [
        SyntaxKind.ColonToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.semicolon)) {
      this.#position += 1;
      return [
        SyntaxKind.SemicolonToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Comma)) {
      this.#position += 1;
      return [
        SyntaxKind.CommaToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(this.#position, CharacterCode.Ampersand, CharacterCode.Ampersand)
    ) {
      this.#position += 2;
      return [
        SyntaxKind.AmpersandAmpersandToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Ampersand, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.AmpersandEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Ampersand)) {
      this.#position += 1;
      return [
        SyntaxKind.AmpersandToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Bang, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.ExclamationEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Bang)) {
      this.#position += 1;
      return [
        SyntaxKind.ExclamationToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Dot, CharacterCode.Dot)) {
      this.#position += 2;
      return [
        SyntaxKind.DotDotToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(this.#position, CharacterCode.Dot) &&
      !isDigit(this.sourceText.getCharAt(this.#position + 1))
    ) {
      this.#position += 1;
      return [
        SyntaxKind.DotToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Equals, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.EqualsEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Equals, CharacterCode.GreaterThan)) {
      this.#position += 2;
      return [
        SyntaxKind.EqualsGreaterThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Equals)) {
      this.#position += 1;
      return [
        SyntaxKind.EqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(
        this.#position,
        CharacterCode.GreaterThan,
        CharacterCode.GreaterThan,
        CharacterCode.Equals
      )
    ) {
      this.#position += 3;
      return [
        SyntaxKind.GreaterThanGreaterThanEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(
        this.#position,
        CharacterCode.GreaterThan,
        CharacterCode.GreaterThan
      )
    ) {
      this.#position += 2;
      return [
        SyntaxKind.GreaterThanGreaterThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(this.#position, CharacterCode.GreaterThan, CharacterCode.Equals)
    ) {
      this.#position += 2;
      return [
        SyntaxKind.GreaterThanEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.GreaterThan)) {
      this.#position += 1;
      return [
        SyntaxKind.GreaterThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Hat, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.CaretEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Hat)) {
      this.#position += 1;
      return [
        SyntaxKind.CaretToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(
        this.#position,
        CharacterCode.Hook,
        CharacterCode.Hook,
        CharacterCode.Equals
      )
    ) {
      this.#position += 3;
      return [
        SyntaxKind.HookHookEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Hook, CharacterCode.Hook)) {
      this.#position += 2;
      return [
        SyntaxKind.HookHookToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Hook)) {
      this.#position += 1;
      return [
        SyntaxKind.HookToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(
        this.#position,
        CharacterCode.LessThan,
        CharacterCode.LessThan,
        CharacterCode.Equals
      )
    ) {
      this.#position += 3;
      return [
        SyntaxKind.LessThanLessThanEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(this.#position, CharacterCode.LessThan, CharacterCode.LessThan)
    ) {
      this.#position += 2;
      return [
        SyntaxKind.LessThanLessThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.LessThan, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.LessThanEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.LessThan)) {
      this.#position += 1;
      return [
        SyntaxKind.LessThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(this.#position, CharacterCode.Minus, CharacterCode.GreaterThan)
    ) {
      this.#position += 2;
      return [
        SyntaxKind.MinusGreaterThanToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Minus, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.MinusEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Minus)) {
      this.#position += 1;
      return [
        SyntaxKind.MinusToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Percent, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.PercentEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Percent)) {
      this.#position += 1;
      return [
        SyntaxKind.PercentToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Pipe, CharacterCode.Pipe)) {
      this.#position += 2;
      return [
        SyntaxKind.BarBarToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Pipe, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.PipeEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Pipe)) {
      this.#position += 1;
      return [
        SyntaxKind.BarToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Plus, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.PlusEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Plus)) {
      this.#position += 1;
      return [
        SyntaxKind.PlusToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Slash, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.SlashEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Slash)) {
      this.#position += 1;
      return [
        SyntaxKind.SlashToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (
      this.sourceText.matchesAll(
        this.#position,
        CharacterCode.Star,
        CharacterCode.Star,
        CharacterCode.Equals
      )
    ) {
      this.#position += 3;
      return [
        SyntaxKind.StarStarEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Star, CharacterCode.Star)) {
      this.#position += 2;
      return [
        SyntaxKind.AsteriskAsteriskToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Star, CharacterCode.Equals)) {
      this.#position += 2;
      return [
        SyntaxKind.StarEqualsToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Star)) {
      this.#position += 1;
      return [
        SyntaxKind.AsteriskToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Tilde)) {
      this.#position += 1;
      return [
        SyntaxKind.TildeToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.DoubleQuote)) {
      return this.#scanString();
    }
    if (
      isDigitStart(
        this.sourceText.getCharAt(this.#position),
        this.sourceText.getCharAt(this.#position + 1),
        this.sourceText.getCharAt(this.#position + 2)
      )
    ) {
      return this.#scanNumber();
    }
    if (isIdentifierStart(this.sourceText.getCharAt(this.#position))) {
      return this.#scanIdentifier();
    }
    if (this.sourceText.matchesAll(this.#position, CharacterCode.Eof)) {
      return [
        SyntaxKind.EofToken,
        new SourceSpan(this.sourceText, Range.create(start, this.#position)),
        undefined
      ];
    }

    this.#position += 1;
    const invalidSpan = new SourceSpan(this.sourceText, Range.create(start, this.#position));
    this.#diagnostics.push(Diagnostic.invalidCharacter(invalidSpan));
    return [SyntaxKind.InvalidSyntaxToken, invalidSpan, undefined];
  }

  #scanNumber(): [syntaxKind: SyntaxTokenKind, sourceSpan: SourceSpan, value: unknown] {
    const start = this.#position;
    let read = 0;
    let isFloat = false;
    let isInvalid = false;
    let base: 2 | 10 | 16 = 10;

    if (this.sourceText.matchesAll(start + read, CharacterCode.Minus)) read++;

    if (this.#matchesText(start + read, "0b")) {
      read += 2;
      base = 2;

      const digitsStart = read;
      while (this.#matchesAnyText(start + read, "0", "1")) read++;

      isInvalid ||= read === digitsStart;
    } else if (this.#matchesText(start + read, "0x") || this.#matchesText(start + read, "0X")) {
      read += 2;
      base = 16;

      const digitsStart = read;
      while (this.#isHexDigit(this.sourceText.getCharAt(start + read))) read++;

      isInvalid ||= read === digitsStart;
    } else {
      while (isDigit(this.sourceText.getCharAt(start + read))) read++;

      if (this.sourceText.matchesAll(start + read, CharacterCode.Dot)) {
        isFloat = true;
        read++;

        while (isDigit(this.sourceText.getCharAt(start + read))) read++;
      }

      if (this.#matchesAnyText(start + read, "e", "E")) {
        isFloat = true;

        if (!isDigit(this.sourceText.getCharAt(start + read - 1))) isInvalid = true;

        read++;

        if (this.#matchesAnyText(start + read, "+", "-")) read++;

        const exponentDigitsStart = read;
        while (isDigit(this.sourceText.getCharAt(start + read))) read++;

        isInvalid ||= read === exponentDigitsStart;
      }
    }

    let syntaxKind: SyntaxTokenKind;
    let value: number | bigint;
    const suffix = this.#scanNumberSuffix(start + read, isFloat);
    read += suffix.length;

    if (
      isFloat ||
      suffix.syntaxKind === SyntaxKind.F16LiteralToken ||
      suffix.syntaxKind === SyntaxKind.F32LiteralToken ||
      suffix.syntaxKind === SyntaxKind.F64LiteralToken
    ) {
      syntaxKind = suffix.syntaxKind ?? SyntaxKind.F64LiteralToken;

      const text = this.sourceText.text.slice(start, start + read - suffix.length);
      value = syntaxKind === SyntaxKind.F32LiteralToken ? Math.fround(Number(text)) : Number(text);

      isInvalid ||= base !== 10 || !Number.isFinite(value);
    } else {
      const text = this.sourceText.text.slice(start, start + read - suffix.length);
      const parsed = this.#parseInteger(text, base);
      isInvalid ||= parsed === undefined;
      const integer = parsed ?? 0n;

      switch (suffix.syntaxKind) {
        case SyntaxKind.I8LiteralToken:
          syntaxKind = SyntaxKind.I8LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, -128n, 127n);
          value = Number(integer);
          break;
        case SyntaxKind.U8LiteralToken:
          syntaxKind = SyntaxKind.U8LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, 0n, 255n);
          value = Number(integer);
          break;
        case SyntaxKind.I16LiteralToken:
          syntaxKind = SyntaxKind.I16LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, -32768n, 32767n);
          value = Number(integer);
          break;
        case SyntaxKind.U16LiteralToken:
          syntaxKind = SyntaxKind.U16LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, 0n, 65535n);
          value = Number(integer);
          break;
        case SyntaxKind.I32LiteralToken:
          syntaxKind = SyntaxKind.I32LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, -2147483648n, 2147483647n);
          value = Number(integer);
          break;
        case SyntaxKind.U32LiteralToken:
          syntaxKind = SyntaxKind.U32LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, 0n, 4294967295n);
          value = Number(integer);
          break;
        case SyntaxKind.I64LiteralToken:
          syntaxKind = SyntaxKind.I64LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(
            integer,
            -9223372036854775808n,
            9223372036854775807n
          );
          value = integer;
          break;
        case SyntaxKind.U64LiteralToken:
          syntaxKind = SyntaxKind.U64LiteralToken;
          isInvalid ||= !this.#isInIntegerRange(integer, 0n, 18446744073709551615n);
          value = integer;
          break;
        default:
          if (this.#isInIntegerRange(integer, -2147483648n, 2147483647n)) {
            syntaxKind = SyntaxKind.I32LiteralToken;
            value = Number(integer);
          } else {
            syntaxKind = SyntaxKind.I64LiteralToken;
            isInvalid ||= !this.#isInIntegerRange(
              integer,
              -9223372036854775808n,
              9223372036854775807n
            );
            value = integer;
          }
          break;
      }
    }

    const sourceSpan = new SourceSpan(this.sourceText, Range.create(start, start + read));
    this.#position = start + read;

    if (isInvalid) this.#diagnostics.push(Diagnostic.invalidNumber(sourceSpan));

    return [syntaxKind, sourceSpan, value];
  }

  #scanIdentifier(): [syntaxKind: LexerSyntaxKind, sourceSpan: SourceSpan, value: unknown] {
    const start = this.#position;

    do {
      this.#position++;
    } while (isIdentifierPart(this.sourceText.getCharAt(this.#position)));

    const sourceSpan = new SourceSpan(this.sourceText, Range.create(start, this.#position));
    const text = sourceSpan.getText();
    const syntaxKind = SyntaxFacts.getKeywordKind(text);
    const value =
      syntaxKind === SyntaxKind.TrueKeyword
        ? true
        : syntaxKind === SyntaxKind.FalseKeyword
          ? false
          : undefined;

    return [syntaxKind, sourceSpan, value];
  }

  #scanNumberSuffix(
    position: number,
    isFloat: boolean
  ): { readonly length: number; readonly syntaxKind?: SyntaxTokenKind } {
    if (this.#matchesText(position, "f16"))
      return { length: 3, syntaxKind: SyntaxKind.F16LiteralToken };
    if (this.#matchesText(position, "f32"))
      return { length: 3, syntaxKind: SyntaxKind.F32LiteralToken };
    if (this.#matchesText(position, "f64"))
      return { length: 3, syntaxKind: SyntaxKind.F64LiteralToken };

    if (isFloat) return { length: 0 };

    if (this.#matchesText(position, "i8"))
      return { length: 2, syntaxKind: SyntaxKind.I8LiteralToken };
    if (this.#matchesText(position, "u8"))
      return { length: 2, syntaxKind: SyntaxKind.U8LiteralToken };
    if (this.#matchesText(position, "i16"))
      return { length: 3, syntaxKind: SyntaxKind.I16LiteralToken };
    if (this.#matchesText(position, "u16"))
      return { length: 3, syntaxKind: SyntaxKind.U16LiteralToken };
    if (this.#matchesText(position, "i32"))
      return { length: 3, syntaxKind: SyntaxKind.I32LiteralToken };
    if (this.#matchesText(position, "u32"))
      return { length: 3, syntaxKind: SyntaxKind.U32LiteralToken };
    if (this.#matchesText(position, "i64"))
      return { length: 3, syntaxKind: SyntaxKind.I64LiteralToken };
    if (this.#matchesText(position, "u64"))
      return { length: 3, syntaxKind: SyntaxKind.U64LiteralToken };

    return { length: 0 };
  }

  #parseInteger(text: string, base: 2 | 10 | 16): bigint | undefined {
    const isNegative = text.startsWith("-");
    const unsignedText = isNegative ? text.slice(1) : text;
    const digits = base === 2 || base === 16 ? unsignedText.slice(2) : unsignedText;

    if (digits.length === 0) return undefined;

    let value: bigint;
    try {
      value = BigInt(base === 2 ? `0b${digits}` : base === 16 ? `0x${digits}` : digits);
    } catch {
      return undefined;
    }

    return isNegative ? -value : value;
  }

  #isInIntegerRange(value: bigint, min: bigint, max: bigint): boolean {
    return value >= min && value <= max;
  }

  #isHexDigit(char: CharacterCode): boolean {
    return (
      isDigit(char) ||
      (char >= CharacterCode.UpperA && char <= CharacterCode.UpperF) ||
      (char >= CharacterCode.LowerA && char <= CharacterCode.LowerF)
    );
  }

  #matchesText(position: number, text: string): boolean {
    for (let i = 0; i < text.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      if (this.sourceText.getCharAt(position + i) !== text.charCodeAt(i)) return false;
    }

    return true;
  }

  #matchesAnyText(position: number, ...texts: string[]): boolean {
    return texts.some((text) => this.#matchesText(position, text));
  }

  #scanString(): [syntaxKind: SyntaxTokenKind, sourceSpan: SourceSpan, value: unknown] {
    {
      const start = this.#position;
      let terminated = false;
      const builder = new Array<string>();
      this.#position++; // Skip opening quote.

      while (true) {
        if (
          this.sourceText.matchesAny(
            this.#position,
            CharacterCode.CarriageReturn,
            CharacterCode.LineFeed,
            CharacterCode.Eof
          )
        ) {
          break;
        }
        if (
          this.sourceText.matchesAll(
            this.#position,
            CharacterCode.Backslash,
            CharacterCode.DoubleQuote
          )
        ) {
          builder.push('"');
          this.#position += 2;
          continue;
        }
        if (this.sourceText.matchesAll(this.#position, CharacterCode.DoubleQuote)) {
          this.#position++;
          terminated = true;
          break;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        builder.push(this.sourceText.text[this.#position]!);
        this.#position++;
      }

      const sourceSpan = new SourceSpan(this.sourceText, Range.create(start, this.#position));
      if (!terminated) this.#diagnostics.push(Diagnostic.unterminatedString(sourceSpan));

      return [SyntaxKind.StrLiteralToken, sourceSpan, builder.join("")];
    }
  }

  *#scanSyntaxTrivia(): Iterable<SyntaxTrivia> {
    while (true) {
      if (this.sourceText.matchesAll(this.#position, CharacterCode.Slash, CharacterCode.Star))
        yield this.#scanMultiLineComment();
      else if (this.sourceText.matchesAll(this.#position, CharacterCode.Slash, CharacterCode.Slash))
        yield this.#scanSingleLineComment();
      else if (
        this.sourceText.matchesAny(
          this.#position,
          CharacterCode.CarriageReturn,
          CharacterCode.LineFeed
        )
      )
        yield this.#scanLineBreak();
      else if (isWhiteSpace(this.sourceText.getCharAt(this.#position)))
        yield this.#scanWhiteSpace();
      else break;
    }
  }

  #scanMultiLineComment(): SyntaxTrivia {
    let terminated = false;
    const start = this.#position;
    this.#position += 2; // Skip '/*'.
    while (true) {
      if (this.sourceText.getCharAt(this.#position) === CharacterCode.Eof) break;
      if (this.sourceText.matchesAll(this.#position, CharacterCode.Star, CharacterCode.Slash)) {
        this.#position += 2;
        terminated = true;
        break;
      }
      this.#position++;
    }

    if (!terminated)
      this.#diagnostics.push(
        Diagnostic.unterminatedComment(
          new SourceSpan(this.sourceText, Range.create(start, this.#position))
        )
      );

    return new SyntaxTrivia(
      SyntaxKind.MultiLineCommentTrivia,
      new SourceSpan(this.sourceText, Range.create(start, this.#position))
    );
  }

  #scanSingleLineComment(): SyntaxTrivia {
    const start = this.#position;
    this.#position += 2; // Skip '//'.

    while (
      this.sourceText.getCharAt(this.#position) !== CharacterCode.CarriageReturn &&
      this.sourceText.getCharAt(this.#position) !== CharacterCode.LineFeed &&
      this.sourceText.getCharAt(this.#position) !== CharacterCode.Eof
    )
      this.#position++;

    return new SyntaxTrivia(
      SyntaxKind.SingleLineCommentTrivia,
      new SourceSpan(this.sourceText, Range.create(start, this.#position))
    );
  }

  #scanLineBreak(): SyntaxTrivia {
    const start = this.#position;
    this.#position += this.sourceText.matchesAll(
      this.#position,
      CharacterCode.CarriageReturn,
      CharacterCode.LineFeed
    )
      ? 2
      : 1;
    return new SyntaxTrivia(
      SyntaxKind.LineBreakTrivia,
      new SourceSpan(this.sourceText, Range.create(start, this.#position))
    );
  }

  #scanWhiteSpace() {
    const start = this.#position;
    while (isWhiteSpace(this.sourceText.getCharAt(this.#position))) this.#position++;
    return new SyntaxTrivia(
      SyntaxKind.WhiteSpaceTrivia,
      new SourceSpan(this.sourceText, Range.create(start, this.#position))
    );
  }
}
