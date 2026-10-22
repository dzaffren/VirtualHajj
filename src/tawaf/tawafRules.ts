import { insideHijr, lineAngle } from "../scene/mataf";
import type { HudView, Mistake, MistakeKind } from "./hudView";

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
  counted: number;
  mistakes: Mistake[];
  done: boolean;
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
    counted: 0,
    mistakes: [],
    done: false,
  };
}

export function move(s: TawafState, x: number, z: number): TawafState {
  if (s.done) return s;
  let d = Math.atan2(-z, x) - s.angle;
  d -= turn * Math.round(d / turn);
  const angle = s.angle + d;
  const k = crossings(angle);
  let next = { ...s, angle };
  if (k > crossings(s.angle)) {
    if (!s.started || s.void)
      next = { ...next, started: true, start: k, furthest: angle, void: null };
    else if (k === s.start + 1) {
      const counted = s.counted + 1;
      next = { ...next, start: k, furthest: angle, counted };
      if (s.hints && counted >= 7) return { ...next, done: true };
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

export function hudView(
  s: TawafState,
  lineOffScreen: "left" | "right" | null = null,
): HudView {
  if (s.done) return { phase: "done", mistakes: s.mistakes };
  if (!s.started) return { phase: "before-line", lineOffScreen };
  if (s.void) return { phase: "void", round: s.counted + 1, kind: s.void };
  return { phase: "round", round: s.counted + 1 };
}
