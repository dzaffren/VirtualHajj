import { describe, expect, it } from "vitest";
import { lineAngle, onCircle } from "../scene/mataf";
import { hudView, move, start, type TawafState } from "./tawafRules";

const r = 16;
const lap = 2 * Math.PI;
const metres = (m: number) => m / r;

// Before the line, facing it, as the page starts.
const begin = (hints: boolean) => {
  const p = onCircle(r, lineAngle - 0.5);
  return start(p.x, p.z, hints);
};

// Walks the pilgrim round its circle by an angle, in steps of about 30 cm. A negative angle walks clockwise.
function walk(s: TawafState, by: number, radius = r): TawafState {
  const from = s.angle;
  const n = Math.ceil((Math.abs(by) * radius) / 0.3);
  for (let i = 1; i <= n; i++) {
    const p = onCircle(radius, from + (by * i) / n);
    s = move(s, p.x, p.z);
  }
  return s;
}

const toLine = (s: TawafState) => walk(s, lineAngle + 0.05 - s.angle);
const laps = (s: TawafState, n: number) => walk(s, n * lap);

describe("tawafRules, seven clean rounds", () => {
  it("counts nothing before the pilgrim first crosses the line", () => {
    let s = walk(begin(true), 0.4);
    s = walk(s, -metres(5));
    expect(hudView(s)).toEqual({ phase: "before-line", lineOffScreen: null });
  });

  it("starts nothing on a clockwise approach to the line", () => {
    const p = onCircle(r, lineAngle + 0.5);
    const s = walk(start(p.x, p.z, true), -1);
    expect(hudView(s).phase).toBe("before-line");
  });

  it("shows the edge arrow's side before the line", () => {
    expect(hudView(begin(true), "left")).toEqual({
      phase: "before-line",
      lineOffScreen: "left",
    });
  });

  it("starts round 1 at the first anticlockwise crossing", () => {
    expect(hudView(toLine(begin(true)))).toEqual({ phase: "round", round: 1 });
  });

  it("counts a clean lap", () => {
    expect(hudView(laps(toLine(begin(true)), 1))).toEqual({
      phase: "round",
      round: 2,
    });
  });

  it("ends the tawaf after seven clean rounds, with no mistakes", () => {
    expect(hudView(laps(toLine(begin(true)), 7))).toEqual({
      phase: "done",
      mistakes: [],
    });
  });

  it("names nothing for a 2 m step back in round 4", () => {
    let s = walk(laps(toLine(begin(true)), 3), 1);
    s = walk(s, -metres(2));
    s = walk(s, 1);
    expect(hudView(s)).toEqual({ phase: "round", round: 4 });
  });

  it("does not count a round twice when a step back recrosses the line", () => {
    let s = walk(toLine(begin(true)), -metres(1));
    s = walk(s, metres(2));
    expect(hudView(s)).toEqual({ phase: "round", round: 1 });
  });
});
