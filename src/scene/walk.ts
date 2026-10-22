import { body, edge, hijr, kaabah } from "./mataf";

export interface Point {
  x: number;
  z: number;
}
// facing is the turn about y, for a model that faces +z.
export interface Pose extends Point {
  facing: number;
}
export interface Keys {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}
export interface WalkInput {
  target: Point | null;
  keys: Keys;
  // 1 for a learner; the e2e hook walks 10 times faster (D43).
  pace: number;
}

export const walkSpeed = 3.4;
const turnSpeed = (120 * Math.PI) / 180;
const maxDt = 0.1;
// Each frame's walk is checked against the walls every 25 cm, so a fast frame can't pass through one.
const substep = 0.25;

// The nearest point on the middle of the Hijr Ismail wall's arc.
function onHijrWall(x: number, z: number): Point {
  const { faceZ, radius, halfSpan } = hijr;
  const a = Math.max(-halfSpan, Math.min(halfSpan, Math.atan2(x, faceZ - z)));
  return { x: radius * Math.sin(a), z: faceZ - radius * Math.cos(a) };
}

// Pushes a spot out of the Kaabah and off the Hijr Ismail wall, and back inside the edge. Pushing out along the nearest side slides the pilgrim along a wall.
function collide(x: number, z: number): Point {
  const out = Math.hypot(x, z);
  if (out > edge) [x, z] = [(x * edge) / out, (z * edge) / out];

  const hx = kaabah.halfX + body;
  const hz = kaabah.halfZ + body;
  const px = hx - Math.abs(x);
  const pz = hz - Math.abs(z);
  if (px > 0 && pz > 0) {
    if (px < pz) x = x < 0 ? -hx : hx;
    else z = z < 0 ? -hz : hz;
  }

  const w = onHijrWall(x, z);
  const clear = hijr.thickness / 2 + body;
  const d = Math.hypot(x - w.x, z - w.z);
  if (d < clear && d > 0)
    [x, z] = [w.x + ((x - w.x) * clear) / d, w.z + ((z - w.z) * clear) / d];
  return { x, z };
}

// One frame of walking: towards the target, or by the held arrow keys (D44). An arrow key drops the target.
// The target is dropped on arrival, or when a wall stops the pilgrim.
export function step(
  pose: Pose,
  { keys, pace, ...input }: WalkInput,
  dt: number,
): { pose: Pose; target: Point | null } {
  const t = Math.min(dt, maxDt);
  const steering = keys.up || keys.down || keys.left || keys.right;
  let target = steering ? null : input.target;
  let facing =
    pose.facing + (Number(keys.left) - Number(keys.right)) * turnSpeed * t;
  const ahead = Number(keys.up) - Number(keys.down);
  const want = target || ahead ? walkSpeed * pace * t : 0;

  let { x, z } = pose;
  for (let left = want; left > 0; left -= substep) {
    let d = Math.min(substep, left);
    let dx = Math.sin(facing) * ahead;
    let dz = Math.cos(facing) * ahead;
    if (target) {
      dx = target.x - x;
      dz = target.z - z;
      const n = Math.hypot(dx, dz);
      if (n === 0) break;
      facing = Math.atan2(dx, dz);
      d = Math.min(d, n);
      [dx, dz] = [dx / n, dz / n];
    }
    ({ x, z } = collide(x + dx * d, z + dz * d));
  }

  if (target) {
    const arrived = Math.hypot(target.x - x, target.z - z) < 0.01;
    const blocked = Math.hypot(x - pose.x, z - pose.z) < want * 0.05;
    if (arrived || blocked) target = null;
  }
  return { pose: { x, z, facing }, target };
}
