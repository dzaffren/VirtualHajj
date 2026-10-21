import { MathUtils, Spherical, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { orbitLimits, orbitStep } from "./orbitStep";

const target = new Vector3(0, 6, 0);
const start = new Vector3(26, 12, 30);

function spherical(position: Vector3) {
  return new Spherical().setFromVector3(position.clone().sub(target));
}

function press(key: string, times: number, from = start) {
  let position = from;
  for (let i = 0; i < times; i++) {
    position = orbitStep(position, target, key, orbitLimits) ?? position;
  }
  return position;
}

describe("orbitStep", () => {
  it("turns the view round the target with the left and right arrows", () => {
    const before = spherical(start);
    const right = spherical(press("ArrowRight", 1));
    const left = spherical(press("ArrowLeft", 1));
    expect(right.theta - before.theta).toBeCloseTo(0.12);
    expect(left.theta - before.theta).toBeCloseTo(-0.12);
    expect(right.radius).toBeCloseTo(before.radius);
    expect(right.phi).toBeCloseTo(before.phi);
  });

  it("raises and lowers the view with the up and down arrows", () => {
    const before = spherical(start);
    expect(spherical(press("ArrowUp", 1)).phi).toBeLessThan(before.phi);
    expect(spherical(press("ArrowDown", 1)).phi).toBeGreaterThan(before.phi);
  });

  it("zooms in with + and = and out with - and _", () => {
    const before = spherical(start).radius;
    expect(spherical(press("+", 1)).radius).toBeCloseTo(before * 0.9);
    expect(spherical(press("=", 1)).radius).toBeCloseTo(before * 0.9);
    expect(spherical(press("-", 1)).radius).toBeCloseTo(before * 1.1);
    expect(spherical(press("_", 1)).radius).toBeCloseTo(before * 1.1);
  });

  it("keeps the camera between 16 m and 70 m from the Kaabah", () => {
    expect(spherical(press("+", 50)).radius).toBeCloseTo(16);
    expect(spherical(press("-", 50)).radius).toBeCloseTo(70);
  });

  it("keeps the camera at least 5 degrees above the ground", () => {
    const low = spherical(press("ArrowDown", 50));
    expect(MathUtils.radToDeg(low.phi)).toBeLessThanOrEqual(85 + 1e-9);
    expect(press("ArrowDown", 50).y).toBeGreaterThan(target.y);
  });

  it("stops short of looking straight down", () => {
    expect(spherical(press("ArrowUp", 50)).phi).toBeCloseTo(
      orbitLimits.minPolarAngle,
    );
  });

  it("ignores other keys", () => {
    expect(orbitStep(start, target, "a", orbitLimits)).toBeNull();
    expect(orbitStep(start, target, "Tab", orbitLimits)).toBeNull();
  });
});
