import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Vector3 } from "three";
import { onLine } from "../scene/mataf";
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

  // Before round 1, which side of the screen the line is off, if the camera can't see it.
  const lineSide = ({ camera }: RootState, x: number, z: number) => {
    const p = onLine(x, z);
    const local = spot.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
    const ahead = local.z < 0;
    const across = local.clone().applyMatrix4(camera.projectionMatrix).x;
    if (ahead && Math.abs(across) <= 1) return null;
    return local.x < 0 ? "left" : "right";
  };

  useFrame((state, delta) => {
    if (paused) return;
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
    if (!walked.target && arrived.current) {
      arrived.current();
      arrived.current = null;
    }
    tawaf.current = move(tawaf.current, x, z);
    onMove(tawaf.current.started ? null : lineSide(state, x, z));
  });

  return null;
}
