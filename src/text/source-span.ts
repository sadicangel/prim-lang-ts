import type { Range } from "./range.js";
import type { SourceText } from "./source-text.js";


export class SourceSpan {
    constructor(readonly sourceText: SourceText, readonly range: Range) { }

    get startLine(): number { return this.sourceText.getLineIndex(this.range.start); }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    get startCharacter(): number { return this.range.start - this.sourceText.lines[this.startLine]!.range.start; }

    get endLine(): number { return this.sourceText.getLineIndex(this.range.end); }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    get endCharacter(): number { return this.range.end - this.sourceText.lines[this.startLine]!.range.start; }

    getText(): string {
        return this.sourceText.getText(this.range);
    }

    toString(): string {
        return this.getText();
    }
}
