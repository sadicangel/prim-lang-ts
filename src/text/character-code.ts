
export const enum CharacterCode {
    Eof = -1,
    Null = 0,

    Tab = 9,// \t
    LineFeed = 10,// \n
    CarriageReturn = 13,// \r
    Space = 32,

    Bang = 33,// !
    DoubleQuote = 34,// "
    Percent = 37,// %
    Ampersand = 38,// &
    ParenthesisOpen = 40,// (
    ParenthesisClose = 41,// )
    Star = 42,// *
    Plus = 43,// +
    Comma = 44,// ,
    Minus = 45,// -
    Dot = 46,// .
    Slash = 47,// /

    Zero = 48,
    Nine = 57,

    Colon = 58,// :
    semicolon = 59,// ;
    LessThan = 60,// <
    Equals = 61,// =
    GreaterThan = 62,// >
    Hook = 63,// ?

    UpperA = 65,
    UpperF = 70,
    UpperZ = 90,

    BracketOpen = 91,// [
    Backslash = 92,// \
    BracketClose = 93,// ]
    Hat = 94,// ^
    Underscore = 95,// _

    LowerA = 97,
    LowerF = 102,
    LowerZ = 122,

    BraceOpen = 123,// {
    Pipe = 124,// |
    BraceClose = 125,// }
    Tilde = 126
}

export function isWhitespace(ch: CharacterCode): boolean {
    return ch === CharacterCode.Space
        || ch === CharacterCode.Tab
        || ch === CharacterCode.CarriageReturn
        || ch === CharacterCode.LineFeed;
}

export function isDigit(ch: CharacterCode): boolean {
    return ch >= CharacterCode.Zero && ch <= CharacterCode.Nine;
}

export function isDigitStart(c1: CharacterCode, c2: CharacterCode, c3: CharacterCode): boolean {
    return isDigit(c1)
        || (c1 === CharacterCode.Dot && isDigit(c2))
        || (c1 === CharacterCode.Minus && isDigit(c2))
        || (c1 === CharacterCode.Minus && c2 === CharacterCode.Dot && isDigit(c3));
}

export function isAsciiLetter(ch: CharacterCode): boolean {
    return (ch >= CharacterCode.UpperA && ch <= CharacterCode.UpperZ)
        || (ch >= CharacterCode.LowerA && ch <= CharacterCode.LowerZ);
}

export function isIdentifierStart(ch: CharacterCode): boolean {
    return isAsciiLetter(ch) || ch === CharacterCode.Underscore;
}

export function isIdentifierPart(ch: CharacterCode): boolean {
    return isIdentifierStart(ch) || isDigit(ch);
}