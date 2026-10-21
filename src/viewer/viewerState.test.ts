import { describe, expect, it } from "vitest";
import { viewerState } from "./viewerState";

describe("viewerState", () => {
  it("is ready once the first frame is drawn", () => {
    expect(viewerState("loading", "first-frame")).toBe("ready");
  });
});
