import { describe, expect, it } from "vitest";

import { Range } from "../src/text/range.js";

describe("Range", () => {
  it("creates a half-open range", () => {
    const range = Range.create(2, 5);

    expect(range).toEqual({ start: 2, end: 5 });
    expect(Range.length(range)).toBe(3);
    expect(Range.toString(range)).toBe("2..5");
  });

  it("creates a range from a start and length", () => {
    expect(Range.fromStartAndLength(2, 3)).toEqual({ start: 2, end: 5 });
  });

  it("treats the end position as exclusive", () => {
    const range = Range.create(2, 5);

    expect(Range.contains(range, 2)).toBe(true);
    expect(Range.contains(range, 4)).toBe(true);
    expect(Range.contains(range, 5)).toBe(false);
  });

  it("slices text using the range bounds", () => {
    expect(Range.slice("abcdef", Range.create(1, 4))).toBe("bcd");
  });
});
