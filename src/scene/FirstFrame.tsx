import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export function FirstFrame({ onFrame }: { onFrame: () => void }) {
  const drawn = useRef(false);
  useFrame(() => {
    if (drawn.current) return;
    drawn.current = true;
    onFrame();
  });
  return null;
}
