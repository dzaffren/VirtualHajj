import { lineAngle } from "../scene/mataf";
import type { HudView, Mistake } from "./hudView";

// The tawaf rules (D32, D33), fed one pilgrim position at a time.
// The angle round the Kaabah is unwrapped, so each anticlockwise lap adds 2π,
// and the line crossings are counted by index: k = floor((angle − line angle) / 2π).
export interface TawafState {
  hints: boolean;
  angle: number;
  started: boolean;
  // k when the round being walked started.
  start: number;
  counted: number;
  mistakes: Mistake[];
  done: boolean;
}

const turn = 2 * Math.PI;
const crossings = (angle: number) => Math.floor((angle - lineAngle) / turn);

export function start(x: number, z: number, hints: boolean): TawafState {
  return {
    hints,
    angle: Math.atan2(-z, x),
    started: false,
    start: 0,
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
  const next = { ...s, angle };
  if (k <= crossings(s.angle)) return next;
  if (!s.started) return { ...next, started: true, start: k };
  if (k !== s.start + 1) return next;
  const counted = s.counted + 1;
  return { ...next, start: k, counted, done: s.hints && counted >= 7 };
}

export function hudView(
  s: TawafState,
  lineOffScreen: "left" | "right" | null = null,
): HudView {
  if (s.done) return { phase: "done", mistakes: s.mistakes };
  if (!s.started) return { phase: "before-line", lineOffScreen };
  return { phase: "round", round: s.counted + 1 };
}
