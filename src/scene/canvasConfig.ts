import type { CanvasProps } from "@react-three/fiber";

// One Canvas setup for every page, so /perf measures what / draws (D22).
export const canvasConfig = {
  dpr: [1, 2],
  flat: true,
  gl: { antialias: true },
  camera: { fov: 50, near: 0.1, far: 400, position: [26, 12, 30] },
} satisfies Partial<CanvasProps>;
