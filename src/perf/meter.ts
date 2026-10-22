// The /perf meter (D22): frames counted in fixed one-second slots from the first frame, and a verdict at 5:00.
export const RUN_MS = 5 * 60 * 1000;
const SLOTS = RUN_MS / 1000;

export type Verdict = "running" | "pass" | "below-30" | "stopped";

export interface Reading {
  lowest: number | null;
  now: number | null;
  elapsedMs: number;
  verdict: Verdict;
}

export interface Meter {
  first: number | null;
  slot: number;
  slotFrames: number;
  reading: Reading;
}

export function startMeter(): Meter {
  return {
    first: null,
    slot: 0,
    slotFrames: 0,
    reading: { lowest: null, now: null, elapsedMs: 0, verdict: "running" },
  };
}

export function meterFrame(m: Meter, at: number): Meter {
  if (m.reading.verdict !== "running") return m;
  if (m.first === null) return { ...m, first: at, slot: 0, slotFrames: 1 };

  const t = at - m.first;
  const slot = Math.min(Math.floor(t / 1000), SLOTS);
  if (slot === m.slot) return { ...m, slotFrames: m.slotFrames + 1 };

  // The slot is over. A slot skipped on the way had no frame at all.
  const fps = slot > m.slot + 1 ? 0 : m.slotFrames;
  const lowest = Math.min(m.reading.lowest ?? fps, fps);
  const elapsedMs = Math.min(t, RUN_MS);
  const reading: Reading = { lowest, now: fps, elapsedMs, verdict: "running" };
  if (slot < SLOTS) return { ...m, slot, slotFrames: 1, reading };
  return {
    ...m,
    slot,
    slotFrames: 0,
    reading: { ...reading, verdict: lowest >= 30 ? "pass" : "below-30" },
  };
}

export function meterStop(m: Meter, at: number): Meter {
  if (m.reading.verdict !== "running") return m;
  const elapsedMs = m.first === null ? 0 : Math.min(at - m.first, RUN_MS);
  return {
    ...m,
    reading: { ...m.reading, now: null, elapsedMs, verdict: "stopped" },
  };
}

export function clock(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
