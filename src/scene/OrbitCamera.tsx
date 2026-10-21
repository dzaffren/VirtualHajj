import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, type ComponentRef } from "react";
import { Vector3 } from "three";
import { orbitLimits, orbitStep } from "./orbitStep";
import { useMediaQuery } from "./useMediaQuery";

const target = new Vector3(0, 6, 0);

// Orbits round the Kaabah by drag, pinch, wheel, or the keyboard once the scene has focus. No pan.
export function OrbitCamera() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const el: HTMLElement | undefined = useThree((s) => s.events.connected);

  useEffect(() => {
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      const c = controls.current;
      if (!c) return;
      const next = orbitStep(c.object.position, c.target, e, orbitLimits);
      if (!next) return;
      e.preventDefault();
      c.object.position.copy(next);
      c.update();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [el]);

  return (
    <OrbitControls
      ref={controls}
      target={target}
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      {...orbitLimits}
    />
  );
}
