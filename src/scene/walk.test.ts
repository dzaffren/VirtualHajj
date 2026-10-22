import { describe, expect, it } from "vitest";
import { insideHijr } from "./mataf";
import { step, walkSpeed, type Keys, type Pose, type WalkInput } from "./walk";

const still: Keys = { up: false, down: false, left: false, right: false };
const to = (x: number, z: number): WalkInput => ({
  target: { x, z },
  keys: still,
  pace: 1,
});

// Steps at 60 frames a second until the walk stops, or for 60 s.
function walkTo(from: Pose, x: number, z: number) {
  let walked = { pose: from, target: to(x, z).target };
  for (let i = 0; i < 3600 && walked.target; i++)
    walked = step(walked.pose, { ...to(x, z), target: walked.target }, 1 / 60);
  return walked;
}

const facingX: Pose = { x: 10, z: 0, facing: Math.PI / 2 };

describe("walk.step", () => {
  it("walks towards the target at 3.4 m/s, facing it", () => {
    const { pose, target } = step(facingX, to(10, 10), 0.1);
    expect(walkSpeed).toBe(3.4);
    expect(pose.x).toBeCloseTo(10);
    expect(pose.z).toBeCloseTo(0.34);
    expect(pose.facing).toBeCloseTo(0);
    expect(target).toEqual({ x: 10, z: 10 });
  });

  it("caps a frame at 0.1 s, so a tab back from the background does not jump", () => {
    expect(step(facingX, to(10, 10), 5).pose.z).toBeCloseTo(0.34);
  });

  it("walks ten times faster at pace 10", () => {
    expect(step(facingX, { ...to(10, 10), pace: 10 }, 0.1).pose.z).toBeCloseTo(
      3.4,
    );
  });

  it("stops on the target", () => {
    const { pose, target } = step(facingX, to(10, 0.2), 0.1);
    expect(pose.z).toBeCloseTo(0.2);
    expect(target).toBeNull();
  });

  it("walks forward on Up and back on Down, the way it faces", () => {
    const up = step(
      facingX,
      { ...to(0, 0), keys: { ...still, up: true } },
      0.1,
    );
    expect(up.pose.x).toBeCloseTo(10.34);
    expect(up.target).toBeNull();
    const down = step(
      facingX,
      { target: null, keys: { ...still, down: true }, pace: 1 },
      0.1,
    );
    expect(down.pose.x).toBeCloseTo(9.66);
  });

  it("turns left and right at 120° a second", () => {
    const turn = (keys: Keys) =>
      step(facingX, { target: null, keys, pace: 1 }, 0.1).pose.facing;
    expect(turn({ ...still, left: true })).toBeCloseTo(
      Math.PI / 2 + Math.PI / 15,
    );
    expect(turn({ ...still, right: true })).toBeCloseTo(
      Math.PI / 2 - Math.PI / 15,
    );
  });

  it("stops at the Kaabah, 0.4 m out, when the target is behind it", () => {
    const { pose, target } = walkTo({ x: 12, z: 0, facing: 0 }, -12, 0);
    expect(pose.x).toBeCloseTo(5.9);
    expect(target).toBeNull();
  });

  it("slides round a corner of the Kaabah to a target on the far side", () => {
    const { pose } = walkTo({ x: 9, z: 2, facing: 0 }, 2, 9);
    expect(pose.x).toBeCloseTo(2);
    expect(pose.z).toBeCloseTo(9);
  });

  it("walks in through the Hijr Ismail's gap", () => {
    const { pose } = walkTo({ x: 8, z: -6, facing: 0 }, 0, -9);
    expect(pose.x).toBeCloseTo(0);
    expect(pose.z).toBeCloseTo(-9);
    expect(insideHijr(pose.x, pose.z)).toBe(true);
  });

  it("stops at the Hijr Ismail wall", () => {
    const { pose, target } = walkTo({ x: 0, z: -16, facing: 0 }, 0, -9);
    expect(pose.z).toBeCloseTo(-13.2);
    expect(target).toBeNull();
    expect(insideHijr(pose.x, pose.z)).toBe(false);
  });

  it("stays within 30 m of the Kaabah", () => {
    const { pose, target } = walkTo({ x: 25, z: 0, facing: 0 }, 40, 0);
    expect(pose.x).toBeCloseTo(30);
    expect(target).toBeNull();
  });
});
