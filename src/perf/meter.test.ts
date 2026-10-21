import { describe, expect, it } from "vitest";
import {
  clock,
  meterFrame,
  meterStop,
  RUN_MS,
  startMeter,
  type Meter,
} from "./meter";

// Feeds frames at a steady rate from `from` until `until`, both in ms.
function run(
  fps: number,
  from: number,
  until: number,
  m = startMeter(),
): Meter {
  for (let i = 0; ; i++) {
    const at = from + (i * 1000) / fps;
    if (at > until) return m;
    m = meterFrame(m, at);
  }
}

describe("meter", () => {
  it("passes a run that holds 30 FPS for 5 minutes", () => {
    const { reading } = run(30, 0, RUN_MS);
    expect(reading.verdict).toBe("pass");
    expect(reading.lowest).toBe(30);
  });

  it("fails a run that holds 29 FPS", () => {
    const { reading } = run(29, 0, RUN_MS);
    expect(reading.verdict).toBe("below-30");
    expect(reading.lowest).toBe(29);
  });

  it("fails a run that holds 29.6 FPS", () => {
    const { reading } = run(29.6, 0, RUN_MS);
    expect(reading.verdict).toBe("below-30");
    expect(reading.lowest).toBe(29);
  });

  it("fails a run with one slow second", () => {
    let m = run(60, 0, 100_000);
    m = run(20, 100_050, 101_000, m);
    m = run(60, 101_000 + 1000 / 60, RUN_MS, m);
    expect(m.reading.verdict).toBe("below-30");
    expect(m.reading.lowest).toBe(20);
  });

  it("gives the verdict at exactly 5:00", () => {
    const before = run(60, 0, RUN_MS - 1);
    expect(before.reading.verdict).toBe("running");
    const at = meterFrame(before, RUN_MS);
    expect(at.reading.verdict).toBe("pass");
    expect(at.reading.elapsedMs).toBe(RUN_MS);
  });

  it("leaves out the wait before the first frame", () => {
    const { reading } = run(30, 8000, 8000 + RUN_MS);
    expect(reading.verdict).toBe("pass");
    expect(reading.lowest).toBe(30);
  });

  it("reads one-second windows, not single frames", () => {
    const m = run(60, 0, 999);
    expect(m.reading.now).toBeNull();
    expect(run(60, 0, 1000).reading.now).toBe(60);
  });

  it("fails the run when the browser drops the 3D view", () => {
    const m = meterStop(run(60, 0, 134_000), 134_500);
    expect(m.reading.verdict).toBe("stopped");
    expect(m.reading.now).toBeNull();
    expect(clock(m.reading.elapsedMs)).toBe("2:14");
  });

  it("keeps the verdict once the run is over", () => {
    const done = run(60, 0, RUN_MS);
    expect(meterStop(done, RUN_MS + 10).reading.verdict).toBe("pass");
    expect(meterFrame(done, RUN_MS + 2000).reading).toBe(done.reading);
  });

  it("writes the time as minutes and seconds", () => {
    expect(clock(0)).toBe("0:00");
    expect(clock(134_999)).toBe("2:14");
    expect(clock(RUN_MS)).toBe("5:00");
  });
});
