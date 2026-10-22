import { Canvas, useFrame } from "@react-three/fiber";
import { useReducer, useRef } from "react";
import { BaseScene } from "../scene/BaseScene";
import { canvasConfig } from "../scene/canvasConfig";
import { hasWebGL2 } from "../scene/hasWebGL2";
import { OrbitCamera } from "../scene/OrbitCamera";
import { PrimaryButton } from "../ui/PrimaryButton";
import { TopCard } from "../ui/TopCard";
import { viewerState, type ViewerState } from "./viewerState";

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
  const [state, dispatch] = useReducer(
    viewerState,
    "loading",
    (initial: ViewerState) =>
      hasWebGL2() ? initial : viewerState(initial, "no-webgl"),
  );
  const loading = state === "loading";

  return (
    <div className="app" data-state={state}>
      {state !== "no-webgl" && (
        <Canvas
          {...canvasConfig}
          className="scene"
          tabIndex={state === "ready" ? 0 : -1}
          role="img"
          aria-label="3D view of the Kaabah. Drag, or use the arrow keys, to turn it."
          onCreated={({ gl }) =>
            gl.domElement.addEventListener("webglcontextlost", () =>
              dispatch("context-lost"),
            )
          }
        >
          <BaseScene />
          <OrbitCamera />
          <FirstFrame onFrame={() => dispatch("first-frame")} />
        </Canvas>
      )}
      <div className="backdrop" />
      {state === "no-webgl" && (
        <TopCard
          name="VirtualHajj"
          say={<span>This browser can't show the 3D view.</span>}
          body="Open this link in an up-to-date Chrome or Safari."
        />
      )}
      {state === "stopped" && (
        <TopCard
          name="VirtualHajj"
          say={<span>The 3D view stopped.</span>}
          body="Reload the page to start it again."
          action={
            <PrimaryButton onClick={() => location.reload()}>
              Reload
            </PrimaryButton>
          }
        />
      )}
      {(loading || state === "ready") && (
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
      )}
    </div>
  );
}
