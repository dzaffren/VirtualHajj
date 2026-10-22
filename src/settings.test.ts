import { describe, expect, it } from "vitest";
import { pickHints } from "./settings";

describe("pickHints", () => {
  it("is off only when off is stored", () => {
    expect(pickHints("off")).toBe(false);
    expect(pickHints("on")).toBe(true);
  });

  it("is on when nothing, or an unknown value, is stored", () => {
    expect(pickHints(null)).toBe(true);
    expect(pickHints("false")).toBe(true);
  });
});
