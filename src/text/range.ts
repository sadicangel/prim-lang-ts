export type Range = Readonly<{
  readonly start: number;
  readonly end: number;
}>;

export const Range = Object.freeze({
  create(start: number, end: number): Range {
    assertNonNegativeSafeInteger(start, "start");
    assertNonNegativeSafeInteger(end, "end");

    if (end < start) {
      throw new RangeError("end must be greater than or equal to start.");
    }

    return Object.freeze({ start, end });
  },

  fromStartAndLength(start: number, length: number): Range {
    assertNonNegativeSafeInteger(start, "start");
    assertNonNegativeSafeInteger(length, "length");

    const end = start + length;
    assertNonNegativeSafeInteger(end, "end");

    return Range.create(start, end);
  },

  emptyAt(position: number): Range {
    return Range.create(position, position);
  },

  single(position: number): Range {
    return Range.fromStartAndLength(position, 1);
  },

  full(length: number): Range {
    return Range.fromStartAndLength(0, length);
  },

  length(range: Range): number {
    return range.end - range.start;
  },

  isEmpty(range: Range): boolean {
    return range.start === range.end;
  },

  contains(range: Range, position: number): boolean {
    return position >= range.start && position < range.end;
  },

  containsRange(range: Range, other: Range): boolean {
    return other.start >= range.start && other.end <= range.end;
  },

  overlaps(range: Range, other: Range): boolean {
    return range.start < other.end && other.start < range.end;
  },

  equals(range: Range, other: Range): boolean {
    return range.start === other.start && range.end === other.end;
  },

  slice(text: string, range: Range): string {
    return text.slice(range.start, range.end);
  },

  toString(range: Range): string {
    return `${range.start.toString()}..${range.end.toString()}`;
  }
});

function assertNonNegativeSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer.`);
  }
}
