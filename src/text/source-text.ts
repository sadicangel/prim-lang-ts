import { CharacterCode } from "./character-code.js";
import { Range } from "./range.js";
import { SourceLine } from "./source-line.js";
import { SourceSpan } from "./source-span.js";

export class SourceText {
    #lines?: readonly SourceLine[];

    get length(): number { return this.text.length; }
    get lines(): readonly SourceLine[] { return this.#lines ??= SourceText.parseLines(this); }

    constructor(readonly text: string, readonly path?: string) { }

    getCharAt(index: number): CharacterCode {
        return index < 0 || index >= this.length ? CharacterCode.Eof : this.text.charCodeAt(index);
    }

    getText(range: Range): string {
        return this.text.slice(range.start, range.end);
    }

    getSpan(range: Range): SourceSpan {
        return new SourceSpan(this, range);
    }

    getLineIndex(position: number): number {
        let lower = 0;
        let upper = this.lines.length - 1;

        while (lower <= upper) {
            const index = lower + (upper - lower) / 2;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const start = this.lines[index]!.range.start;

            if (position == start)
                return index;

            if (start > position)
                upper = index - 1;
            else
                lower = index + 1;
        }

        return lower - 1;
    }

    matchesAll(index: number, ...chars: CharacterCode[]): boolean {
        for (let i = 0; i < chars.length; ++i) {
            if (this.getCharAt(index + i) !== chars[i])
                return false;
        }

        return true;
    }

    matchesAny(index: number, ...chars: CharacterCode[]): boolean {
        const currentChar = this.getCharAt(index);
        for (const char of chars)
            if (char === currentChar)
                return true;

        return false;
    }

    toString(): string {
        return this.text;
    }

    private static parseLines(sourceText: SourceText): readonly SourceLine[] {
        const lines = new Array<SourceLine>();
        let position = 0;
        let lineStart = 0;
        while (position < sourceText.length) {
            const lineBreakWidth = sourceText.matchesAll(position, CharacterCode.CarriageReturn, CharacterCode.LineFeed)
                ? 2
                : sourceText.matchesAny(position, CharacterCode.CarriageReturn, CharacterCode.LineFeed)
                    ? 1
                    : 0;

            if (lineBreakWidth == 0) {
                position++;
            }
            else {
                lines.push(new SourceLine(sourceText, Range.create(lineStart, position), Range.create(lineStart, position + lineBreakWidth)));
                position += lineBreakWidth;
                lineStart = position;
            }
        }

        if (position >= lineStart)
            lines.push(new SourceLine(sourceText, Range.create(lineStart, position), Range.create(lineStart, position)));

        return lines;
    }
}

