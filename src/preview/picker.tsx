import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Lang } from "../copy";
import { LanguageChoice } from "../ui/LanguageChoice";
import { states } from "./states";

// A developer page (D26): pick a state, a language and a size, and see the real HUD in a frame.
const sizes = {
  phone: { name: "Phone, 390 × 844", w: 390, h: 844 },
  laptop: { name: "Laptop, 1280 × 720", w: 1280, h: 720 },
};
type Size = keyof typeof sizes;
const groups = [...new Set(states.map((s) => s.group))];

function Picker() {
  const [id, setId] = useState("istilam");
  const [lang, setLang] = useState<Lang>("en");
  const [size, setSize] = useState<Size>("phone");
  const s = states.find((x) => x.id === id)!;
  const src = `/preview/stage.html?state=${id}&lang=${lang}`;
  const frame = sizes[size];

  return (
    <main>
      <header>
        <h1>Tawaf preview</h1>
        <label>
          <span>State</span>
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {states
                  .filter((x) => x.group === g)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          <span>Size</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as Size)}
          >
            {Object.entries(sizes).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <span>Language</span>
          <LanguageChoice label="Language" lang={lang} onChange={setLang} />
        </div>
      </header>
      <p className="about">
        {s.group} · {s.label} · scenario {s.scenario}.{" "}
        <a href={src} target="_blank" rel="noreferrer">
          Open this state alone
        </a>
        . The hints switch, the menu and the language choice work. Tab to see
        focus. Light or dark follows your device.
      </p>
      <iframe
        key={src}
        src={src}
        title={`${s.label}, ${frame.name}`}
        style={{ width: frame.w, height: frame.h }}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Picker />
  </StrictMode>,
);
