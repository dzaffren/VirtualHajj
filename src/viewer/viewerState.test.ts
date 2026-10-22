import { describe, expect, it } from "vitest";
import { viewerState } from "./viewerState";

describe("viewerState", () => {
  it("is ready once the first frame is drawn", () => {
    expect(viewerState("loading", "first-frame")).toBe("ready");
  });

  it("says there is no WebGL 2 while loading", () => {
    expect(viewerState("loading", "no-webgl")).toBe("no-webgl");
  });

  it("stops when the browser drops the 3D view", () => {
    expect(viewerState("ready", "context-lost")).toBe("stopped");
  });

  it("stops when the view drops before the first frame", () => {
    expect(viewerState("loading", "context-lost")).toBe("stopped");
  });

  it("stays stopped until the page reloads", () => {
    expect(viewerState("stopped", "first-frame")).toBe("stopped");
  });

  it("stays on the no-WebGL message", () => {
    expect(viewerState("no-webgl", "first-frame")).toBe("no-webgl");
    expect(viewerState("no-webgl", "context-lost")).toBe("no-webgl");
  });
});
