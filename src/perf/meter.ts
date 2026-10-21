// The /perf meter (D22): one-second FPS windows from the first frame, and a verdict at 5:00.
export const RUN_MS = 5 * 60 * 1000;

export type Verdict = "running" | "pass" | "below-30" | "stopped";

export interface Reading {
  lowest: number | null;
  now: number | null;
  elapsedMs: number;
  verdict: Verdict;
}

export interface Meter {
  first: number | null;
  windowStart: number;
  windowFrames: number;
  reading: Reading;
}

export function startMeter(): Meter {
  return {
    first: null,
    windowStart: 0,
    windowFrames: 0,
    reading: { lowest: null, now: null, elapsedMs: 0, verdict: "running" },
  };
}

export function meterFrame(m: Meter, at: number): Meter {
  if (m.reading.verdict !== "running") return m;
  if (m.first === null) return { ...m, first: at, windowStart: at };

  const elapsedMs = Math.min(at - m.first, RUN_MS);
  const windowFrames = m.windowFrames + 1;
  const span = at - m.windowStart;
  let next: Meter = { ...m, windowFrames };
  if (span >= 1000) {
    // Rounded down, so a reading of 30 always means 30 FPS or more.
    const fps = Math.floor((windowFrames * 1000) / span);
    const lowest = Math.min(m.reading.lowest ?? fps, fps);
    next = {
      ...m,
      windowStart: at,
      windowFrames: 0,
      reading: { lowest, now: fps, elapsedMs, verdict: "running" },
    };
  }
  if (elapsedMs < RUN_MS) return next;
  const lowest = next.reading.lowest;
  return {
    ...next,
    reading: {
      ...next.reading,
      elapsedMs,
      verdict: lowest !== null && lowest >= 30 ? "pass" : "below-30",
    },
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
