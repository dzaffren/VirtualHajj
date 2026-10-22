import { Canvas } from "@react-three/fiber";
import { useReducer } from "react";
import { copy } from "../copy";
import { BaseScene } from "../scene/BaseScene";
import { canvasConfig } from "../scene/canvasConfig";
import { FirstFrame } from "../scene/FirstFrame";
import { hasWebGL2 } from "../scene/hasWebGL2";
import { OrbitCamera } from "../scene/OrbitCamera";
import { useLang } from "../settings";
import { LanguageChoice } from "../ui/LanguageChoice";
import { PrimaryButton } from "../ui/PrimaryButton";
import { TopCard } from "../ui/TopCard";
import { viewerState, type ViewerState } from "./viewerState";

export function App() {
  const [state, dispatch] = useReducer(
    viewerState,
    "loading",
    (initial: ViewerState) =>
      hasWebGL2() ? initial : viewerState(initial, "no-webgl"),
  );
  const [lang, saveLang] = useLang();
  const t = copy[lang];
  const loading = state === "loading";

  return (
    <div className="app" data-state={state}>
      {state !== "no-webgl" && (
        <Canvas
          {...canvasConfig}
          className="scene"
          tabIndex={state === "ready" ? 0 : -1}
          role="img"
          aria-label={t.viewerLabel}
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
          name={t.appName}
          say={<span>{t.noWebgl}</span>}
          body={t.noWebglNext}
        />
      )}
      {state === "stopped" && (
        <TopCard
          name={t.appName}
          say={<span>{t.stopped}</span>}
          body={t.stoppedNext}
          action={
            <PrimaryButton onClick={() => location.reload()}>
              {t.reload}
            </PrimaryButton>
          }
        />
      )}
      {(loading || state === "ready") && (
        <TopCard
          name={t.appName}
          say={
            <>
              <span className="when-loading" aria-hidden={!loading}>
                {t.loading}
              </span>
              <span className="when-ready" aria-hidden={loading}>
                {t.viewerSay}
              </span>
            </>
          }
          hint={
            <>
              <span className="hint-touch">{t.viewerTouch}</span>
              <span className="hint-mouse">{t.viewerMouse}</span>
            </>
          }
          action={
            <a className="primary-button" href="/tawaf/">
              {t.startTawaf}
            </a>
          }
        >
          <div className="lang-row">
            <p>{t.language}</p>
            <LanguageChoice
              label={t.language}
              lang={lang}
              onChange={saveLang}
            />
          </div>
        </TopCard>
      )}
    </div>
  );
}
