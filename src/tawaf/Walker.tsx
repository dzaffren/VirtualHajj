import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Vector3 } from "three";
import {
  hajarAswad,
  lineAngle,
  lineLength,
  onCircle,
  onLine,
} from "../scene/mataf";
import type { PilgrimPose } from "../scene/Pilgrim";
import { step, type Keys, type Point } from "../scene/walk";
import { move, type TawafState } from "./tawafRules";

declare global {
  interface Window {
    vh?: {
      walkTo: (x: number, z: number) => Promise<Point>;
      position: () => Point;
    };
  }
}

// ?e2e=1 lets a test script steer the learner's own pilgrim, 10 times faster (D43).
const e2e = new URLSearchParams(location.search).get("e2e") === "1";
const pace = e2e ? 10 : 1;
// Radians of leg swing per metre walked, so the legs keep time with the speed.
const gaitRate = 4;

interface WalkerProps {
  tawaf: RefObject<TawafState>;
  pose: RefObject<PilgrimPose>;
  target: RefObject<Point | null>;
  keys: RefObject<Keys>;
  paused: boolean;
  onTap: (x: number, z: number) => void;
  onMove: (lineOffScreen: "left" | "right" | null) => void;
}

// Inside the Canvas. Each frame: walk.step, then tawafRules.move, then the pose ref.
export function Walker({
  tawaf,
  pose,
  target,
  keys,
  paused,
  onTap,
  onMove,
}: WalkerProps) {
  const gait = useRef(0);
  const arrived = useRef<(() => void) | null>(null);
  const spot = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!e2e) return;
    const position = () => ({ x: pose.current.x, z: pose.current.z });
    window.vh = {
      walkTo: (x, z) => {
        onTap(x, z);
        return new Promise((resolve) => {
          arrived.current = () => resolve(position());
        });
      },
      position,
    };
    return () => {
      delete window.vh;
    };
  }, [onTap, pose]);

  // Before round 1: null while the camera sees any of the line, else the side it is off, by the point as far out as the pilgrim.
  const lineSide = ({ camera }: RootState, x: number, z: number) => {
    const corner = Math.hypot(hajarAswad.x, hajarAswad.z);
    for (let i = 0; i <= 4; i++) {
      const p = onCircle(corner + (lineLength * i) / 4, lineAngle);
      spot.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
      if (spot.z >= 0) continue;
      spot.applyMatrix4(camera.projectionMatrix);
      if (Math.abs(spot.x) <= 1 && Math.abs(spot.y) <= 1) return null;
    }
    const p = onLine(x, z);
    spot.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
    return spot.x < 0 ? "left" : "right";
  };

  // The hook's walk ends on arrival, at a wall, or when the walk pauses for a sheet.
  const settle = () => {
    arrived.current?.();
    arrived.current = null;
  };

  useFrame((state, delta) => {
    if (paused) return settle();
    const was = pose.current;
    const walked = step(
      was,
      { target: target.current, keys: keys.current, pace },
      delta,
    );
    const { x, z } = walked.pose;
    const moved = Math.hypot(x - was.x, z - was.z);
    gait.current += moved * gaitRate;
    pose.current = {
      ...walked.pose,
      stride: moved > 0 ? Math.sin(gait.current) * 0.5 : was.stride * 0.8,
    };
    target.current = walked.target;
    if (!walked.target) settle();
    tawaf.current = move(tawaf.current, x, z);
    onMove(tawaf.current.started ? null : lineSide(state, x, z));
  });

  return null;
}
