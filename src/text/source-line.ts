import type { Range } from "./range.js";
import { SourceText } from "./source-text.js"

export class SourceLine {
    constructor(readonly sourceText: SourceText, readonly range: Range, readonly rangeWithLineBreak: Range) { }

    getText(): string {
        return this.sourceText.getText(this.range);
    }

    getTextWithLineBreak(): string {
        return this.sourceText.getText(this.rangeWithLineBreak);
    }

    toString(): string {
        return this.getText();
    }
}

