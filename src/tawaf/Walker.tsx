import { useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Vector3 } from "three";
import {
  hajarAswad,
  istilamPose,
  lineAngle,
  lineLength,
  maqam,
  maqamSpot,
  onCircle,
  onLine,
} from "../scene/mataf";
import type { PilgrimPose } from "../scene/Pilgrim";
import { useMediaQuery } from "../scene/useMediaQuery";
import { step, type Keys, type Point } from "../scene/walk";
import type { Side } from "./hudView";
import { raiseAt, showMeLength } from "./showMe";
import { atStation, move, type TawafState } from "./tawafRules";

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
// Five points along the Hajar Aswad line, for the camera test.
const corner = Math.hypot(hajarAswad.x, hajarAswad.z);
const linePoints = [0, 1, 2, 3, 4].map((i) =>
  onCircle(corner + (lineLength * i) / 4, lineAngle),
);

interface WalkerProps {
  tawaf: RefObject<TawafState>;
  pose: RefObject<PilgrimPose>;
  target: RefObject<Point | null>;
  keys: RefObject<Keys>;
  paused: boolean;
  // Show me how is playing on the pilgrim.
  demo: boolean;
  onTap: (x: number, z: number) => void;
  onMove: (offScreen: Side) => void;
  onShown: () => void;
}

// Inside the Canvas. Each frame: walk.step, then tawafRules.move, then the pose ref.
export function Walker({
  tawaf,
  pose,
  target,
  keys,
  paused,
  demo,
  onTap,
  onMove,
  onShown,
}: WalkerProps) {
  const gait = useRef(0);
  const arrived = useRef<(() => void) | null>(null);
  const spot = useMemo(() => new Vector3(), []);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Seconds into Show me how, or null when it is not playing.
  const demoAt = useRef<number | null>(null);

  useEffect(() => {
    demoAt.current = demo ? 0 : null;
    if (!demo) pose.current = { ...pose.current, raise: 0 };
  }, [demo, pose]);

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

  // The next target: the line before round 1, by the point as far out as the pilgrim, and the spot behind the Maqam Ibrahim after the rounds.
  // null while the camera sees any of it, or in the rounds; else the side it is off.
  const offScreen = ({ camera }: RootState, x: number, z: number): Side => {
    const { started, afterRounds } = tawaf.current;
    if (started && !afterRounds) return null;
    const points = afterRounds ? [maqamSpot] : linePoints;
    for (const p of points) {
      spot.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
      if (spot.z >= 0) continue;
      spot.applyMatrix4(camera.projectionMatrix);
      if (Math.abs(spot.x) <= 1 && Math.abs(spot.y) <= 1) return null;
    }
    const p = afterRounds ? maqamSpot : onLine(x, z);
    spot.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
    return spot.x < 0 ? "left" : "right";
  };

  // The hook's walk ends on arrival, at a wall, or when the walk pauses for a sheet.
  const settle = () => {
    arrived.current?.();
    arrived.current = null;
  };

  useFrame((state, delta) => {
    if (demoAt.current !== null) {
      const t = (demoAt.current += delta);
      const over = t >= showMeLength(reduced);
      pose.current = { ...pose.current, raise: over ? 0 : raiseAt(t, reduced) };
      if (over) {
        demoAt.current = null;
        onShown();
      }
    }
    // A station stops the walk on the frame the rules enter it, before React pauses the Walker.
    if (paused || atStation(tawaf.current)) return settle();
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
    if (atStation(tawaf.current)) {
      // The pilgrim stands for the station: facing the Hajar Aswad at the line, or the Maqam Ibrahim at the spot.
      const stand = tawaf.current.rakaat
        ? { x, z, facing: Math.atan2(maqam.x - x, maqam.z - z) }
        : istilamPose(x, z);
      pose.current = { ...stand, stride: 0 };
      target.current = null;
      settle();
    }
    onMove(offScreen(state, x, z));
  });

  return null;
}
