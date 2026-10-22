import { describe, expect, it } from "vitest";
import { lineAngle, onCircle } from "../scene/mataf";
import {
  hudView,
  move,
  pressDone,
  setHints,
  start,
  type TawafState,
} from "./tawafRules";

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

// Walks in a straight line from the circle to a spot, in steps of about 30 cm.
function walkStraight(s: TawafState, x: number, z: number): TawafState {
  const from = onCircle(r, s.angle);
  const n = Math.ceil(Math.hypot(x - from.x, z - from.z) / 0.3);
  for (let i = 1; i <= n; i++)
    s = move(
      s,
      from.x + ((x - from.x) * i) / n,
      from.z + ((z - from.z) * i) / n,
    );
  return s;
}

// Round 3 of 7, 1 rad past the line.
const round3 = () => walk(laps(toLine(begin(true)), 2), 1);
const nextLine = (s: TawafState) =>
  walk(
    s,
    lineAngle + 0.05 + lap * Math.ceil((s.angle - lineAngle) / lap) - s.angle,
  );

describe("tawafRules, mistakes", () => {
  it("voids the round when the pilgrim goes back 4 m clockwise", () => {
    expect(hudView(walk(round3(), -metres(4)))).toEqual({
      phase: "void",
      round: 3,
      kind: "wrong-way",
    });
  });

  it("voids the round inside the Hijr Ismail", () => {
    let s = walk(round3(), Math.PI / 2 - 1 - (lineAngle + 0.05) - 0.3);
    s = walkStraight(s, 0, -9);
    expect(hudView(s)).toEqual({ phase: "void", round: 3, kind: "hijr" });
  });

  it("starts the round again at the next crossing, and lists the mistake", () => {
    let s = nextLine(walk(round3(), -metres(4)));
    expect(hudView(s)).toEqual({ phase: "round", round: 3 });
    s = laps(s, 5);
    expect(hudView(s)).toEqual({
      phase: "done",
      mistakes: [{ kind: "wrong-way", round: 3 }],
    });
  });

  it("names one mistake a round, until it starts again", () => {
    let s = walk(round3(), -metres(4));
    s = walkStraight(s, 0, -9);
    s = walk(s, -metres(4));
    expect(s.mistakes).toEqual([{ kind: "wrong-way", round: 3 }]);
  });

  it("names nothing before the line, even inside the Hijr Ismail", () => {
    const p = onCircle(r, Math.PI / 2 + 0.5);
    let s = walkStraight(start(p.x, p.z, true), 0, -9);
    s = walk(s, -metres(5));
    expect(hudView(s)).toEqual({ phase: "before-line", lineOffScreen: null });
  });
});

describe("tawafRules, hints off", () => {
  const counted = (n: number) => laps(toLine(begin(false)), n);

  it("does not end the tawaf at seven rounds", () => {
    expect(hudView(counted(7))).toEqual({ phase: "round", round: 8 });
  });

  it("ends the tawaf at Done after seven rounds", () => {
    expect(hudView(pressDone(counted(7)))).toEqual({
      phase: "done",
      mistakes: [],
    });
  });

  it("counts only whole rounds at Done", () => {
    expect(hudView(pressDone(walk(counted(7), Math.PI)))).toEqual({
      phase: "done",
      mistakes: [],
    });
  });

  it("names Done after six rounds, walks on, and lists it", () => {
    let s = pressDone(counted(6));
    expect(hudView(s)).toEqual({ phase: "short", counted: 6 });
    s = pressDone(s);
    s = laps(s, 1);
    expect(hudView(s)).toEqual({ phase: "round", round: 8 });
    expect(hudView(pressDone(s))).toEqual({
      phase: "done",
      mistakes: [{ kind: "early", counted: 6 }],
    });
  });

  it("ends the tawaf at Done after eight rounds, and lists the extra round", () => {
    expect(hudView(pressDone(counted(8)))).toEqual({
      phase: "done",
      mistakes: [{ kind: "over", walked: 8 }],
    });
  });

  it("shows round 4 when hints come on after three rounds", () => {
    expect(hudView(setHints(counted(3), true))).toEqual({
      phase: "round",
      round: 4,
    });
  });

  it("ends the tawaf when hints come on after eight rounds", () => {
    expect(hudView(setHints(counted(8), true))).toEqual({
      phase: "done",
      mistakes: [{ kind: "over", walked: 8 }],
    });
  });
});
