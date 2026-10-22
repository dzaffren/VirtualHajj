import { describe, expect, it } from "vitest";
import {
  hajarAswad,
  istilamPose,
  lineAngle,
  maqamSpot,
  onCircle,
  rakaatPose,
  rukunIraqiPast,
  rukunYamaniPast,
} from "../scene/mataf";
import {
  finish,
  hudView,
  move,
  pressDone,
  setHints,
  start,
  startRound,
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

// Just past the line, so round 1 starts. With hints on, the walk stops at the istilam sheet, and Start round 1 goes on.
const toLine = (s: TawafState) => {
  s = walk(s, lineAngle + 0.05 - s.angle);
  if (s.istilam !== "sheet") return s;
  s = startRound(s);
  return walk(s, lineAngle + 0.05 - s.angle);
};
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
    expect(hudView(toLine(begin(true)))).toEqual({
      phase: "round",
      round: 1,
      part: "walk",
    });
  });

  it("counts a clean lap", () => {
    expect(hudView(laps(toLine(begin(true)), 1))).toEqual({
      phase: "round",
      round: 2,
      part: "istilam",
    });
  });

  it("leads to the Maqam Ibrahim after seven clean rounds, with no mistakes", () => {
    const s = laps(toLine(begin(true)), 7);
    expect(hudView(s)).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: null,
    });
    expect(s.mistakes).toEqual([]);
  });

  it("names nothing for a 2 m step back in round 4", () => {
    let s = walk(laps(toLine(begin(true)), 3), 1);
    s = walk(s, -metres(2));
    s = walk(s, 1);
    expect(hudView(s)).toEqual({ phase: "round", round: 4, part: "walk" });
  });

  it("does not count a round twice when a step back recrosses the line", () => {
    let s = walk(toLine(begin(true)), -metres(1));
    s = walk(s, metres(2));
    expect(hudView(s)).toEqual({ phase: "round", round: 1, part: "walk" });
  });
});

describe("tawafRules, istilam at the line", () => {
  // Before the line, a distance along the pilgrim's circle.
  const before = (s: TawafState, m: number) =>
    walk(s, lineAngle - metres(m) - s.angle);

  it("raises the sheet within 1 m of the line, and not before", () => {
    let s = before(begin(true), 1.2);
    expect(hudView(s).phase).toBe("before-line");
    s = before(s, 0.9);
    expect(hudView(s)).toEqual({ phase: "istilam", demo: false });
    expect(s.started).toBe(false);
  });

  it("raises the sheet when one frame carries the pilgrim past the line, and the next crossing starts round 1", () => {
    const s = before(begin(true), 2);
    const over = onCircle(r, lineAngle + metres(1.4));
    let next = move(s, over.x, over.z);
    expect(hudView(next)).toEqual({ phase: "istilam", demo: false });
    expect(next.started).toBe(false);
    // The pilgrim stands back before the line, and one frame carries it past again.
    next = move(startRound(next), over.x, over.z);
    expect(hudView(next)).toEqual({ phase: "round", round: 1, part: "walk" });
  });

  it("stands the pilgrim 0.6 m before the line, facing the Hajar Aswad", () => {
    const toCorner = (p: { x: number; z: number }) =>
      Math.hypot(hajarAswad.x - p.x, hajarAswad.z - p.z);
    const over = onCircle(r, lineAngle + metres(1.4));
    const pose = istilamPose(over.x, over.z);
    expect(Math.atan2(-pose.z, pose.x)).toBeCloseTo(lineAngle - metres(0.6));
    const ahead = {
      x: pose.x + Math.sin(pose.facing),
      z: pose.z + Math.cos(pose.facing),
    };
    expect(toCorner(ahead)).toBeCloseTo(toCorner(pose) - 1);

    const short = onCircle(r, lineAngle - metres(0.9));
    expect(istilamPose(short.x, short.z)).toMatchObject(short);
  });

  it("holds the walk while the sheet shows", () => {
    const s = before(begin(true), 0.9);
    expect(walk(s, 1)).toEqual(s);
  });

  it("raises no sheet on a clockwise approach", () => {
    const p = onCircle(r, lineAngle + 0.5);
    const s = walk(start(p.x, p.z, true), -0.5 + metres(0.5));
    expect(hudView(s).phase).toBe("before-line");
  });

  it("starts round 1 at the next crossing after Start round 1", () => {
    let s = startRound(before(begin(true), 0.9));
    expect(hudView(s).phase).toBe("before-line");
    s = walk(s, lineAngle + 0.05 - s.angle);
    expect(hudView(s)).toEqual({ phase: "round", round: 1, part: "walk" });
  });

  it("gives no reminder in round 1", () => {
    const s = walk(toLine(begin(true)), metres(0.5));
    expect(hudView(s)).toEqual({ phase: "round", round: 1, part: "walk" });
  });

  it("reminds of istilam at each later round start, until the Rukun Iraqi", () => {
    for (let n = 1; n <= 6; n++) {
      let s = laps(toLine(begin(true)), n);
      s = walk(s, rukunIraqiPast - 0.1);
      expect(hudView(s)).toEqual({
        phase: "round",
        round: n + 1,
        part: "istilam",
      });
      s = walk(s, 0.1);
      expect(hudView(s)).toEqual({
        phase: "round",
        round: n + 1,
        part: "walk",
      });
    }
  });

  it("closes the sheet when hints go off, and the walk goes on", () => {
    let s = setHints(before(begin(true), 0.9), false);
    expect(hudView(s).phase).toBe("before-line");
    s = walk(s, lineAngle + 0.05 - s.angle);
    expect(hudView(s)).toEqual({ phase: "round", round: 1 });
  });
});

// Walks in a straight line to a spot, in steps of about 30 cm: from the circle, or from another spot.
function walkStraight(
  s: TawafState,
  x: number,
  z: number,
  from = onCircle(r, s.angle),
): TawafState {
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

describe("tawafRules, the Rukun Yamani doa", () => {
  it("shows the doa from the Rukun Yamani to the line, in each round", () => {
    for (let n = 0; n <= 6; n++) {
      let s = laps(toLine(begin(true)), n);
      s = walk(s, rukunYamaniPast - 0.1);
      expect(hudView(s)).toEqual({
        phase: "round",
        round: n + 1,
        part: "walk",
      });
      s = walk(s, 0.1);
      expect(hudView(s)).toEqual({ phase: "round", round: n + 1, part: "doa" });
      if (n === 6) continue;
      expect(hudView(nextLine(s))).toEqual({
        phase: "round",
        round: n + 2,
        part: "istilam",
      });
    }
  });
});

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
    expect(hudView(s)).toEqual({ phase: "round", round: 3, part: "istilam" });
    s = laps(s, 5);
    expect(hudView(s).phase).toBe("to-maqam");
    expect(s.mistakes).toEqual([{ kind: "wrong-way", round: 3 }]);
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

// From the circle just past the line: 20 cm outside the spot behind the Maqam Ibrahim, then 30 cm on into it.
const edge = { x: maqamSpot.x, z: maqamSpot.z + maqamSpot.radius + 0.2 };
const inside = { x: maqamSpot.x, z: maqamSpot.z + maqamSpot.radius - 0.1 };
const toSpot = (s: TawafState) =>
  walkStraight(walkStraight(s, edge.x, edge.z), inside.x, inside.z, edge);

describe("tawafRules, two rakaat behind the Maqam Ibrahim", () => {
  const seven = () => laps(toLine(begin(true)), 7);

  it("gives the spot's side while the camera can't see it", () => {
    expect(hudView(seven(), "left")).toEqual({
      phase: "to-maqam",
      spotOffScreen: "left",
      over: null,
    });
  });

  it("names no mistake on a walk back clockwise, or through the Hijr Ismail", () => {
    let s = walk(seven(), -2.6);
    s = walkStraight(s, 0, -9);
    expect(hudView(s).phase).toBe("to-maqam");
    expect(s.mistakes).toEqual([]);
  });

  it("counts no more rounds at the line", () => {
    const s = walk(walk(seven(), -0.2), 0.4);
    expect(s.counted).toBe(7);
    expect(hudView(s).phase).toBe("to-maqam");
  });

  it("raises the rakaat sheet within 3 m of the spot, and not before", () => {
    let s = walkStraight(seven(), edge.x, edge.z);
    expect(hudView(s).phase).toBe("to-maqam");
    s = walkStraight(s, inside.x, inside.z, edge);
    expect(hudView(s)).toEqual({ phase: "rakaat" });
    expect(walkStraight(s, maqamSpot.x, maqamSpot.z, inside)).toEqual(s);
  });

  it("stands the pilgrim facing the Kaabah where it entered the spot", () => {
    // A walk from the line to the spot's centre enters the 3 m circle here, off the line through the Maqam.
    const pose = rakaatPose(17.03, 4.76);
    expect(pose).toMatchObject({ x: 17.03, z: 4.76 });
    const ahead = {
      x: pose.x + Math.sin(pose.facing),
      z: pose.z + Math.cos(pose.facing),
    };
    expect(Math.hypot(ahead.x, ahead.z)).toBeCloseTo(
      Math.hypot(pose.x, pose.z) - 1,
    );
  });

  it("finishes the tawaf with the rakaat prayed", () => {
    expect(hudView(finish(toSpot(seven())))).toEqual({
      phase: "done",
      mistakes: [],
      prayed: true,
    });
  });
});

describe("tawafRules, the stations with hints off", () => {
  const counted = (n: number) => laps(toLine(begin(false)), n);

  it("raises no sheet at the line, and starts round 1 at the crossing", () => {
    expect(hudView(walk(begin(false), 0.55))).toEqual({
      phase: "round",
      round: 1,
    });
  });

  it("shows no doa from the Rukun Yamani to the line", () => {
    const s = walk(counted(1), rukunYamaniPast);
    expect(hudView(s)).toEqual({ phase: "round", round: 2 });
  });

  it("says seven rounds count at Done, and raises the rakaat sheet at the spot", () => {
    const s = pressDone(counted(7));
    expect(hudView(s)).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: null,
    });
    expect(hudView(toSpot(s))).toEqual({ phase: "rakaat" });
  });

  it("takes arrival at the spot after seven rounds as Done", () => {
    const s = toSpot(counted(7));
    expect(hudView(s)).toEqual({ phase: "rakaat" });
    expect(s.mistakes).toEqual([]);
  });

  it("does nothing at the spot in round 3", () => {
    let s = walk(counted(2), 0.45);
    s = walkStraight(s, maqamSpot.x, maqamSpot.z);
    expect(hudView(s)).toEqual({ phase: "round", round: 3 });
    const on = onCircle(r, s.angle + 0.5);
    s = walkStraight(s, on.x, on.z, maqamSpot);
    expect(hudView(s)).toEqual({ phase: "round", round: 3 });
    expect(s.mistakes).toEqual([]);
  });

  it("takes arrival after eight rounds as Done, and lists the extra round", () => {
    const s = toSpot(counted(8));
    expect(hudView(s)).toEqual({ phase: "rakaat" });
    expect(hudView(finish(s))).toEqual({
      phase: "done",
      mistakes: [{ kind: "over", walked: 8 }],
      prayed: true,
    });
  });

  it("finishes without the rakaat after Done at seven", () => {
    expect(hudView(finish(pressDone(counted(7))))).toEqual({
      phase: "done",
      mistakes: [],
      prayed: false,
    });
  });

  it("names nothing when Done is pressed before the line", () => {
    const s = pressDone(begin(false));
    expect(hudView(s)).toEqual({ phase: "before-line", lineOffScreen: null });
    expect(hudView(pressDone(laps(toLine(s), 7)))).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: null,
    });
  });

  it("does not end the tawaf at seven rounds", () => {
    expect(hudView(counted(7))).toEqual({ phase: "round", round: 8 });
  });

  it("ends the rounds at Done after seven", () => {
    const s = pressDone(counted(7));
    expect(hudView(s)).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: null,
    });
    expect(s.mistakes).toEqual([]);
  });

  it("counts only whole rounds at Done", () => {
    expect(hudView(pressDone(walk(counted(7), Math.PI)))).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: null,
    });
  });

  it("names Done after six rounds, walks on, and lists it", () => {
    let s = pressDone(counted(6));
    expect(hudView(s)).toEqual({ phase: "short", counted: 6 });
    s = pressDone(s);
    s = laps(s, 1);
    expect(hudView(s)).toEqual({ phase: "round", round: 8 });
    expect(pressDone(s).mistakes).toEqual([{ kind: "early", counted: 6 }]);
  });

  it("ends the rounds at Done after eight, and lists the extra round", () => {
    const s = pressDone(counted(8));
    expect(hudView(s)).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: 8,
    });
    expect(s.mistakes).toEqual([{ kind: "over", walked: 8 }]);
  });

  it("shows round 4 when hints come on after three rounds", () => {
    expect(hudView(setHints(counted(3), true))).toEqual({
      phase: "round",
      round: 4,
      part: "istilam",
    });
  });

  it("ends the rounds when hints come on after eight", () => {
    const s = setHints(counted(8), true);
    expect(hudView(s)).toEqual({
      phase: "to-maqam",
      spotOffScreen: null,
      over: 8,
    });
    expect(s.mistakes).toEqual([{ kind: "over", walked: 8 }]);
  });
});
