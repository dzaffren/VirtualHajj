import { MathUtils, Spherical, Vector3 } from "three";

export interface OrbitLimits {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
}

// The camera stays at least 5 degrees above the ground.
export const orbitLimits: OrbitLimits = {
  minDistance: 16,
  maxDistance: 70,
  minPolarAngle: 0.15,
  maxPolarAngle: MathUtils.degToRad(85),
};

const steps: Record<string, { theta?: number; phi?: number; zoom?: number }> = {
  ArrowLeft: { theta: -0.12 },
  ArrowRight: { theta: 0.12 },
  ArrowUp: { phi: -0.08 },
  ArrowDown: { phi: 0.08 },
  "+": { zoom: 0.9 },
  "=": { zoom: 0.9 },
  "-": { zoom: 1.1 },
  _: { zoom: 1.1 },
};

export interface KeyPress {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

export function orbitStep(
  position: Vector3,
  target: Vector3,
  press: KeyPress,
  limits: OrbitLimits,
): Vector3 | null {
  // Ctrl, Cmd and Alt with these keys are the browser's own shortcuts, such as page zoom.
  if (press.ctrlKey || press.metaKey || press.altKey) return null;
  const step = steps[press.key];
  if (!step) return null;
  const s = new Spherical().setFromVector3(position.clone().sub(target));
  s.theta += step.theta ?? 0;
  s.phi = MathUtils.clamp(
    s.phi + (step.phi ?? 0),
    limits.minPolarAngle,
    limits.maxPolarAngle,
  );
  s.radius = MathUtils.clamp(
    s.radius * (step.zoom ?? 1),
    limits.minDistance,
    limits.maxDistance,
  );
  return new Vector3().setFromSpherical(s).add(target);
}
