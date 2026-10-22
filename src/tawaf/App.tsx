import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { copy } from "../copy";
import { canvasConfig } from "../scene/canvasConfig";
import { FirstFrame } from "../scene/FirstFrame";
import { hasWebGL2 } from "../scene/hasWebGL2";
import {
  facingAnticlockwise,
  lineAngle,
  maqamSpot,
  onCircle,
} from "../scene/mataf";
import type { PilgrimPose } from "../scene/Pilgrim";
import { TawafScene } from "../scene/TawafScene";
import type { Keys, Point } from "../scene/walk";
import { useHints, useLang } from "../settings";
import { viewerState, type ViewerState } from "../viewer/viewerState";
import type { HudView, Side } from "./hudView";
import { TawafHud } from "./TawafHud";
import {
  atStation,
  finish,
  hudView,
  pressDone,
  setHints,
  start,
  startRound,
  type TawafState,
} from "./tawafRules";
import { Walker } from "./Walker";

// The pilgrim starts 16 m out and 8 m before the Hajar Aswad line, facing along the tawaf.
const startAngle = lineAngle - 0.5;
const startPose: PilgrimPose = {
  ...onCircle(16, startAngle),
  facing: facingAnticlockwise(startAngle),
  stride: 0,
};

const arrows: Record<string, keyof Keys> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};
const noKeys: Keys = { up: false, down: false, left: false, right: false };

export function App() {
  const [state, dispatch] = useReducer(
    viewerState,
    "loading",
    (initial: ViewerState) =>
      hasWebGL2() ? initial : viewerState(initial, "no-webgl"),
  );
  const [lang, saveLang] = useLang();
  const [hints, saveHints] = useHints();
  const [menuOpen, setMenuOpen] = useState(false);

  // The walk lives in refs, so React renders only when the HUD's view changes.
  const tawaf = useRef<TawafState>(start(startPose.x, startPose.z, hints));
  const pose = useRef(startPose);
  const target = useRef<Point | null>(null);
  const keys = useRef(noKeys);
  const offScreen = useRef<Side>(null);
  const demo = useRef(false);
  const [view, setView] = useState<HudView>(() => hudView(tawaf.current));
  const shown = useRef(JSON.stringify(view));

  const show = useCallback(() => {
    const next = hudView(tawaf.current, offScreen.current, demo.current);
    const key = JSON.stringify(next);
    if (key === shown.current) return;
    shown.current = key;
    setView(next);
  }, []);

  const onMove = useCallback(
    (side: Side) => {
      offScreen.current = side;
      show();
    },
    [show],
  );

  // A tap at a station does not move the pilgrim.
  const onTap = useCallback((x: number, z: number) => {
    if (!atStation(tawaf.current)) target.current = { x, z };
  }, []);

  const onShown = useCallback(() => {
    demo.current = false;
    show();
  }, [show]);

  const paused =
    menuOpen ||
    view.phase === "done" ||
    view.phase === "istilam" ||
    view.phase === "rakaat";

  // The arrow keys walk the pilgrim, except while a sheet is open or a control has focus.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = arrows[e.key];
      if (!key || paused) return;
      if ((e.target as Element).closest("button, a, input, select, textarea"))
        return;
      e.preventDefault();
      keys.current = { ...keys.current, [key]: true };
    };
    const up = (e: KeyboardEvent) => {
      const key = arrows[e.key];
      if (key) keys.current = { ...keys.current, [key]: false };
    };
    const blur = () => {
      keys.current = noKeys;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [paused]);

  const startAgain = () => {
    tawaf.current = start(startPose.x, startPose.z, hints);
    pose.current = startPose;
    target.current = null;
    demo.current = false;
    setMenuOpen(false);
    show();
  };

  const onHints = (on: boolean) => {
    saveHints(on);
    tawaf.current = setHints(tawaf.current, on);
    show();
  };

  const onDone = () => {
    tawaf.current = pressDone(tawaf.current);
    show();
  };

  // The edge arrow turns the pilgrim the way tawaf walks to the line: anticlockwise, with the Kaabah on the left.
  const turnToLine = () => {
    const { x, z } = pose.current;
    target.current = null;
    pose.current = {
      ...pose.current,
      facing: facingAnticlockwise(Math.atan2(-z, x)),
    };
  };

  const turnToSpot = () => {
    const { x, z } = pose.current;
    target.current = null;
    pose.current = {
      ...pose.current,
      facing: Math.atan2(maqamSpot.x - x, maqamSpot.z - z),
    };
  };

  // Start round 1 closes the istilam sheet, and turns the pilgrim along the tawaf.
  const onStartRound = () => {
    tawaf.current = startRound(tawaf.current);
    turnToLine();
    show();
  };

  const onShowMe = () => {
    demo.current = true;
    show();
  };

  const onFinish = () => {
    tawaf.current = finish(tawaf.current);
    show();
  };

  return (
    <div className="app" data-state={state}>
      {state !== "no-webgl" && (
        <Canvas
          {...canvasConfig}
          className="scene"
          role="img"
          aria-label={copy[lang].sceneLabel}
          onCreated={({ gl }) =>
            gl.domElement.addEventListener("webglcontextlost", () =>
              dispatch("context-lost"),
            )
          }
        >
          <Walker
            tawaf={tawaf}
            pose={pose}
            target={target}
            keys={keys}
            paused={paused}
            demo={view.phase === "istilam" && view.demo}
            onTap={onTap}
            onMove={onMove}
            onShown={onShown}
          />
          <TawafScene
            hints={hints}
            pose={pose}
            target={target}
            mistake={view.phase === "void"}
            spot={hints && view.phase === "to-maqam"}
            onTap={onTap}
          />
          <FirstFrame onFrame={() => dispatch("first-frame")} />
        </Canvas>
      )}
      <div className="backdrop" />
      <TawafHud
        view={state === "ready" ? view : { phase: state }}
        hints={hints}
        lang={lang}
        menuOpen={menuOpen}
        onHints={onHints}
        onLang={saveLang}
        onMenu={setMenuOpen}
        onDone={onDone}
        onStartAgain={startAgain}
        onBack={() => location.assign("/")}
        onTurnToLine={turnToLine}
        onReload={() => location.reload()}
        onStartRound={onStartRound}
        onShowMe={onShowMe}
        onFinish={onFinish}
        onTurnToSpot={turnToSpot}
      />
    </div>
  );
}
