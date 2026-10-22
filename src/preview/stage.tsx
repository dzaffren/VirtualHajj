import { Canvas } from "@react-three/fiber";
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { copy, type Lang } from "../copy";
import { BaseScene } from "../scene/BaseScene";
import { canvasConfig } from "../scene/canvasConfig";
import { hasWebGL2 } from "../scene/hasWebGL2";
import { onCircle } from "../scene/mataf";
import { OrbitCamera } from "../scene/OrbitCamera";
import { TawafScene } from "../scene/TawafScene";
import { TawafHud } from "../tawaf/TawafHud";
import { LanguageChoice } from "../ui/LanguageChoice";
import { PrimaryButton } from "../ui/PrimaryButton";
import { TopCard } from "../ui/TopCard";
import { stateById, type PreviewState } from "./states";

// Draws one preview state full-window. The picker frames it at phone or laptop size.
const params = new URLSearchParams(location.search);
const state = stateById(params.get("state"));
const startLang: Lang = params.get("lang") === "ms" ? "ms" : "en";
const webgl2 = hasWebGL2();

function Viewer({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  const t = copy[lang];
  return (
    <div className="app" data-state="ready">
      {webgl2 && (
        <Canvas {...canvasConfig} className="scene">
          <BaseScene />
          <OrbitCamera />
        </Canvas>
      )}
      <div className="backdrop" />
      <TopCard
        name={t.appName}
        say={<span>{t.viewerSay}</span>}
        hint={
          <>
            <span className="hint-touch">{t.viewerTouch}</span>
            <span className="hint-mouse">{t.viewerMouse}</span>
          </>
        }
        action={<PrimaryButton>{t.startTawaf}</PrimaryButton>}
      >
        <div className="lang-row">
          <p>{t.language}</p>
          <LanguageChoice label={t.language} lang={lang} onChange={onLang} />
        </div>
      </TopCard>
    </div>
  );
}

function Tawaf({
  s,
  lang,
  onLang,
}: {
  s: PreviewState;
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  const [hints, setHints] = useState(s.hints);
  const [menuOpen, setMenuOpen] = useState(s.menuOpen ?? false);
  const phase = s.view.phase;
  const covered =
    phase === "loading" || phase === "no-webgl" || phase === "stopped";
  const pose = useRef(s.pose);
  const tap = useRef(
    s.tap ? onCircle(16, Math.atan2(-s.pose.z, s.pose.x) + 0.2) : null,
  );
  return (
    <div className="app" data-state={covered ? phase : "ready"} lang={lang}>
      {webgl2 && phase !== "no-webgl" && (
        <Canvas
          {...canvasConfig}
          className="scene"
          role="img"
          aria-label={copy[lang].sceneLabel}
        >
          <TawafScene
            hints={hints}
            pose={pose}
            target={tap}
            mistake={phase === "void"}
            spot={hints && phase === "to-maqam"}
          />
        </Canvas>
      )}
      <div className="backdrop" />
      <TawafHud
        view={s.view}
        hints={hints}
        lang={lang}
        menuOpen={menuOpen}
        onHints={setHints}
        onLang={onLang}
        onMenu={setMenuOpen}
        onDone={() => {}}
        onStartAgain={() => {}}
        onBack={() => {}}
        onTurnToLine={() => {}}
        onReload={() => {}}
      />
    </div>
  );
}

function Stage() {
  const [lang, setLang] = useState(startLang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return state.page === "viewer" ? (
    <Viewer lang={lang} onLang={setLang} />
  ) : (
    <Tawaf s={state} lang={lang} onLang={setLang} />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Stage />
  </StrictMode>,
);
