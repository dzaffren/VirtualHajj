import { Canvas, useFrame } from "@react-three/fiber";
import { useReducer, useRef } from "react";
import { BaseScene } from "../scene/BaseScene";
import { canvasConfig } from "../scene/canvasConfig";
import { OrbitCamera } from "../scene/OrbitCamera";
import { TopCard } from "../ui/TopCard";
import { viewerState } from "./viewerState";

function FirstFrame({ onFrame }: { onFrame: () => void }) {
  const drawn = useRef(false);
  useFrame(() => {
    if (drawn.current) return;
    drawn.current = true;
    onFrame();
  });
  return null;
}

export function App() {
  const [state, dispatch] = useReducer(viewerState, "loading");
  const loading = state === "loading";

  return (
    <div className="app" data-state={state}>
      <Canvas
        {...canvasConfig}
        className="scene"
        tabIndex={loading ? -1 : 0}
        role="img"
        aria-label="3D view of the Kaabah. Drag, or use the arrow keys, to turn it."
      >
        <BaseScene />
        <OrbitCamera />
        <FirstFrame onFrame={() => dispatch("first-frame")} />
      </Canvas>
      <div className="backdrop" />
      <TopCard
        name="VirtualHajj"
        say={
          <>
            <span className="when-loading" aria-hidden={!loading}>
              Loading the Kaabah…
            </span>
            <span className="when-ready" aria-hidden={loading}>
              Drag to look round the Kaabah.
            </span>
          </>
        }
        hint={
          <>
            <span className="hint-touch">Pinch to zoom in and out.</span>
            <span className="hint-mouse">
              Scroll to zoom. With the keyboard, the arrow keys turn the view
              and + and − zoom.
            </span>
          </>
        }
      />
    </div>
  );
}
