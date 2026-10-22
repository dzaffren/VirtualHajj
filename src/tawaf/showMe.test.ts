import { describe, expect, it } from "vitest";
import { raiseAt, showMeLength } from "./showMe";

describe("showMe", () => {
  it("raises the hand over 0.48 s, holds it for 1 s, and lowers it over 0.48 s", () => {
    expect(showMeLength(false)).toBeCloseTo(1.96);
    expect(raiseAt(0, false)).toBeCloseTo(0);
    expect(raiseAt(0.48, false)).toBeCloseTo(1);
    expect(raiseAt(1, false)).toBe(1);
    expect(raiseAt(1.48, false)).toBeCloseTo(1);
    expect(raiseAt(1.96, false)).toBeCloseTo(0);
    expect(raiseAt(2.5, false)).toBeCloseTo(0);
  });

  it("rises on the settle curve, and falls on the leave curve", () => {
    // Halfway through, ease-settle is nearly there, and ease-leave has barely begun.
    expect(raiseAt(0.24, false)).toBeGreaterThan(0.9);
    expect(raiseAt(1.72, false)).toBeGreaterThan(0.7);
    expect(raiseAt(1.72, false)).toBeLessThan(0.9);
  });

  it("cuts to raised for 1.5 s, and back, with reduced motion", () => {
    expect(showMeLength(true)).toBe(1.5);
    expect(raiseAt(0, true)).toBe(1);
    expect(raiseAt(1.49, true)).toBe(1);
    expect(raiseAt(1.5, true)).toBe(0);
  });
});
