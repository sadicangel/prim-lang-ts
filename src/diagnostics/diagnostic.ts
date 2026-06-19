import { SyntaxFacts } from "../syntax-facts.js";
import { SyntaxKind } from "../syntax-kind.js";
import type { SyntaxToken } from "../syntax-token.js";
import type { SourceSpan } from "../text/source-span.js";
import { DiagnosticCode } from "./diagnostic-code.js";
import { DiagnosticSeverity } from "./diagnostic-severity.js";

export type Diagnostic = Readonly<{
    readonly code: DiagnosticCode;
    readonly severity: DiagnosticSeverity;
    readonly span: SourceSpan;
    readonly message: string;
}>;

function GetDisplayText(syntaxKind: SyntaxKind) {
    return SyntaxFacts.getText(syntaxKind) ?? SyntaxKind[syntaxKind];
}

export const Diagnostic = Object.freeze({
    invalidCharacter(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.InvalidCharacter,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: `Invalid character input: '${sourceSpan.toString()}'`
        };
    },

    invalidEscapeSequence(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.InvalidEscapeSequence,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: `Invalid escape sequence: '${sourceSpan.toString()}'`
        };
    },

    invalidNumber(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.InvalidNumber,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: `Invalid number literal: '${sourceSpan.toString()}'`
        };
    },

    unterminatedDocumentation(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.UnterminatedDocumentation,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: "Unterminated documentation comment"
        };
    },

    unterminatedComment(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.UnterminatedComment,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: "Unterminated comment"
        };
    },

    unterminatedString(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.UnterminatedString,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: "Unterminated string literal"
        };
    },

    unterminatedVerbatimIdentifier(sourceSpan: SourceSpan): Diagnostic {
        return {
            code: DiagnosticCode.UnterminatedVerbatimIdentifier,
            severity: DiagnosticSeverity.Error,
            span: sourceSpan,
            message: "Unterminated verbatim identifier"
        };
    },

    unexpectedToken(expected: SyntaxKind, actual: SyntaxToken): Diagnostic {
        return {
            code: DiagnosticCode.UnexpectedToken,
            severity: DiagnosticSeverity.Error,
            span: actual.sourceSpan,
            message: `Unexpected token '${actual.getValueText()}'. Expected '${GetDisplayText(expected)}'`
        };
    }
});
