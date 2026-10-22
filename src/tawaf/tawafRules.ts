import {
  inSpot,
  insideHijr,
  lineAngle,
  rukunIraqiPast,
  rukunYamaniPast,
  stopBefore,
} from "../scene/mataf";
import type { HudView, Mistake, MistakeKind, RoundPart, Side } from "./hudView";

// The tawaf rules (D32, D33), fed one pilgrim position at a time.
// The angle round the Kaabah is unwrapped, so each anticlockwise lap adds 2π,
// and the line crossings are counted by index: k = floor((angle − line angle) / 2π).
export interface TawafState {
  hints: boolean;
  angle: number;
  started: boolean;
  // k when the round being walked started, and the furthest angle it reached.
  start: number;
  furthest: number;
  // A mistake voids the round until the next crossing.
  void: MistakeKind | null;
  // Done pressed under seven, with hints off: named until the next crossing.
  short: boolean;
  counted: number;
  mistakes: Mistake[];
  done: boolean;
  // With hints on, the istilam sheet rises once, before round 1 (D45).
  istilam: "due" | "sheet" | "done";
  // k when round 1 started: every later round start gets the istilam reminder.
  firstStart: number;
  // The rounds are over: the walk to the Maqam Ibrahim, then the rakaat sheet (D47).
  afterRounds: boolean;
  rakaat: boolean;
  prayed: boolean;
}

const turn = 2 * Math.PI;
// About four steps (O8): a learner who turns round to look does not trip it.
const wrongWayMetres = 3;
const crossings = (angle: number) => Math.floor((angle - lineAngle) / turn);

export function start(x: number, z: number, hints: boolean): TawafState {
  return {
    hints,
    angle: Math.atan2(-z, x),
    started: false,
    start: 0,
    furthest: 0,
    void: null,
    short: false,
    counted: 0,
    mistakes: [],
    done: false,
    istilam: "due",
    firstStart: 0,
    afterRounds: false,
    rakaat: false,
    prayed: false,
  };
}

// While a station sheet shows, the pilgrim stands still and nothing changes.
export function move(s: TawafState, x: number, z: number): TawafState {
  if (s.done || s.rakaat || s.istilam === "sheet") return s;
  let d = Math.atan2(-z, x) - s.angle;
  d -= turn * Math.round(d / turn);
  const angle = s.angle + d;
  const k = crossings(angle);
  let next = { ...s, angle };

  // After the rounds, nothing counts or trips: the pilgrim may walk to the spot behind the Maqam Ibrahim by any path.
  if (s.afterRounds) return inSpot(x, z) ? { ...next, rakaat: true } : next;

  // With hints on, an anticlockwise approach within 1 m of the line raises the istilam sheet, and so does a crossing. That crossing starts nothing.
  if (s.hints && s.istilam === "due" && !s.started && d > 0) {
    const ahead =
      (lineAngle + turn * (crossings(s.angle) + 1) - angle) * Math.hypot(x, z);
    if (ahead <= stopBefore) return { ...next, istilam: "sheet" };
  }

  if (k > crossings(s.angle)) {
    next.short = false;
    if (!s.started)
      next = {
        ...next,
        started: true,
        start: k,
        firstStart: k,
        furthest: angle,
      };
    else if (s.void) next = { ...next, start: k, furthest: angle, void: null };
    else if (k === s.start + 1) {
      const counted = s.counted + 1;
      next = { ...next, start: k, furthest: angle, counted };
      if (s.hints && counted >= 7) return { ...next, afterRounds: true };
    }
  }
  if (!next.started || next.void) return next;

  next.furthest = Math.max(next.furthest, angle);
  const back = (next.furthest - angle) * Math.hypot(x, z);
  const kind: MistakeKind | null =
    back > wrongWayMetres ? "wrong-way" : insideHijr(x, z) ? "hijr" : null;
  if (!kind) return next;
  const mistake = { kind, round: next.counted + 1 };
  return { ...next, void: kind, mistakes: [...next.mistakes, mistake] };
}

// Done counts the rounds already complete, and ends them. Only seven is right (D33). Before the line, tawaf has not started, so nothing is named (D32).
export function pressDone(s: TawafState): TawafState {
  if (!s.started || s.afterRounds || s.short) return s;
  if (s.counted < 7)
    return {
      ...s,
      short: true,
      mistakes: [...s.mistakes, { kind: "early", counted: s.counted }],
    };
  const over: Mistake[] =
    s.counted > 7 ? [{ kind: "over", walked: s.counted }] : [];
  return { ...s, afterRounds: true, mistakes: [...s.mistakes, ...over] };
}

// Finish tawaf ends it, from the rakaat sheet, or with hints off before the rakaat (D48).
export function finish(s: TawafState): TawafState {
  return { ...s, done: true, prayed: s.rakaat };
}

// Start round 1 closes the istilam sheet. The next crossing starts round 1.
export function startRound(s: TawafState): TawafState {
  return { ...s, istilam: "done" };
}

// Hints switch at any time. Hints off closes the istilam sheet, and the walk goes on. Hints on with seven or more counted ends the rounds, as Done does.
export function setHints(s: TawafState, on: boolean): TawafState {
  const next: TawafState = { ...s, hints: on };
  if (!on && s.istilam === "sheet") next.istilam = "done";
  return on && s.counted >= 7 ? pressDone(next) : next;
}

// With hints on: the istilam reminder after every round start but the first, until the Rukun Iraqi, and the doa from the Rukun Yamani to the line (D46).
function part(s: TawafState): RoundPart {
  const past = s.angle - lineAngle - turn * s.start;
  if (past < rukunIraqiPast && s.start !== s.firstStart) return "istilam";
  return past > rukunYamaniPast ? "doa" : "walk";
}

// offScreen is the side of the next target the camera can't see: the line before round 1, the spot after the rounds.
export function hudView(s: TawafState, offScreen: Side = null): HudView {
  if (s.done) return { phase: "done", mistakes: s.mistakes, prayed: s.prayed };
  if (s.rakaat) return { phase: "rakaat" };
  if (s.afterRounds)
    return {
      phase: "to-maqam",
      spotOffScreen: offScreen,
      over: s.counted > 7 ? s.counted : null,
    };
  if (s.istilam === "sheet") return { phase: "istilam", demo: false };
  if (!s.started) return { phase: "before-line", lineOffScreen: offScreen };
  if (s.short) return { phase: "short", counted: s.counted };
  if (s.void) return { phase: "void", round: s.counted + 1, kind: s.void };
  const round = s.counted + 1;
  return s.hints
    ? { phase: "round", round, part: part(s) }
    : { phase: "round", round };
}
